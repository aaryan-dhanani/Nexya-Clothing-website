function doPost(e) {
  // CORS Headers
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;
    var sheet = SpreadsheetApp.getActiveSpreadsheet();

    // =============== SIGN UP ===============
    if (action === "signup") {
      var usersSheet = sheet.getSheetByName("Users") || sheet.insertSheet("Users");
      
      // Add Headers if sheet is empty
      if (usersSheet.getLastRow() === 0) {
        usersSheet.appendRow(["Timestamp", "Name", "Email", "Password", "Address"]);
      }
      
      // Check if email already exists
      var dataRange = usersSheet.getDataRange().getValues();
      for (var i = 1; i < dataRange.length; i++) {
        if (dataRange[i][2] === data.email) {
          return ContentService.createTextOutput(JSON.stringify({success: false, message: "Email already exists! Try logging in."}))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
      
      // Add new user
      usersSheet.appendRow([new Date(), data.name, data.email, data.password, data.address]);
      return ContentService.createTextOutput(JSON.stringify({success: true, message: "Signup successful!"}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // =============== LOG IN ===============
    else if (action === "login") {
      var usersSheet = sheet.getSheetByName("Users");
      if (!usersSheet) {
        return ContentService.createTextOutput(JSON.stringify({success: false, message: "No database found. Please sign up first."}))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      var dataRange = usersSheet.getDataRange().getValues();
      for (var i = 1; i < dataRange.length; i++) {
        if (dataRange[i][2] === data.email && dataRange[i][3] === data.password) {
          return ContentService.createTextOutput(JSON.stringify({
            success: true, 
            message: "Login successful",
            user: {
              name: dataRange[i][1],
              email: dataRange[i][2],
              address: dataRange[i][4]
            }
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({success: false, message: "Invalid email or password!"}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // =============== PLACE ORDER ===============
    else if (action === "order") {
      var ordersSheet = sheet.getSheetByName("Orders") || sheet.insertSheet("Orders");
      
      // Add Headers if sheet is empty
      if (ordersSheet.getLastRow() === 0) {
        ordersSheet.appendRow(["Timestamp", "Order ID", "Customer Name", "Customer Email", "Phone", "Delivery Address", "Items Bought", "Total Amount (₹)", "Status"]);
      }
      
      var orderId = "NEX-" + Math.floor(10000 + Math.random() * 90000);
      
      // Record order into sheet
      ordersSheet.appendRow([
        new Date(),
        orderId,
        data.userName,
        data.userEmail || "Guest",
        data.phone || "N/A",
        data.address,
        data.items, 
        data.total,
        "Pending"
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({success: true, message: "Order placed successfully!", orderId: orderId}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Fallback error
    return ContentService.createTextOutput(JSON.stringify({success: false, message: "Invalid Action!"}))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, message: "Server Error: " + error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Support CORS Preflight requests required by web browsers
function doOptions(e) {
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  return ContentService.createTextOutput("").setHeaders(headers);
}
