var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  user: "root",


  password: "",
  database: "bamazon_db"

});


var cost =0;
var total = 0;
var totalcount = 0;


function options(){


  connection.query('SELECT * FROM products', function(err, results){
    if (err) throw err;
    console.log("What would you like to buy?");

    for (var i = 0; i < results.length; i++) {
      console.log("ID: " + results[i].item_id + " PRODUCT NAME: " + results[i].product_name + " DEPARTMENT: " + results[i].department_name + " PRICE: $" + results[i].price + " QUANTITY AVAILABLE: " + results[i].stock_quantity); 
    }
        inquirer.prompt([{
          type: 'input',
          name: 'item_id',
          message: "What is the ID of the product you would like to buy?"

        }]).then(function(answer){
          var item_id = parseInt(answer.item_id)


          for (var i = 0; i < results.length; i++) {
            if(results[i].item_id == answer.item_id){
              var result = results[i]; 
              console.log('We have ' + result.stock_quantity + ' ' +result.product_name + ' in stock for $' + result.price + ' per Item');

              inquirer.prompt([{
                type: 'input',
                name: 'itemQuantity',
                message: 'How many ' + result.product_name + ' would you like to buy?'

              }]).then(function(answer){
                var quantity = parseInt(answer.itemQuantity);
                
                if(quantity > result.stock_quantity){
                  console.log("Sorry we do not have enough available to fullfil your order. Please choose a lower quantity or select another item.");
                  inquirer.prompt([{
                    type: 'confirm',
                    name: 'shop',
                    message: "Is there anything else we can help you with?"

                  }]).then(function(answer){
                    if(answer.shop){
                      options();
                    }else{
                      console.log("Thank you for your purchase. We hope you love your products.")
                      connection.end();
                    }
                  })

                }else{
                  console.log("Time to pay up! You owe:");

                  connection.query('UPDATE Products SET stock_quantity = stock_quantity - ? WHERE item_id = ?', [quantity, item_id], function(err, results){
                    if (err) throw err;
                  });

                  var cost = result.price;
                  var totalCost = cost * quantity;
                  var totalCostRound = Math.round(totalCost*100)/100;
                  var tax = ((.65 / 10000) * 1000) * totalCost;
                  var taxRound = Math.round(tax*100)/100;
                  var total = totalCostRound + taxRound;
              

                  
                  console.log("QUANTITY ORDERED: " + quantity + " " +result.product_name + '  at ' + "$" + cost);
                  console.log("PRICE:  $" + totalCostRound);
                  console.log("TAX @ 0.0775%: $" + taxRound);
                  console.log("YOUR TOTAL BALANCE IS:  $" + total);

                  inquirer.prompt([{
                    type: 'confirm',
                    name: 'shop',
                    message: "Is there anything else you would like to purchase?"

                  }]).then(function(answer){
                    if(answer.shop){
                      options();
                    }else{
                      console.log("Thank you for your business.")
                      connection.end();
                    }
                  })
                  
                }
              })
            }
          }
        })
      
  });
//      
}
options();
