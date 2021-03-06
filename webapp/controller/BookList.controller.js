sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter"
], function (Controller, Fragment, MessageToast, Filter, FilterOperator, Sorter) {
    "use strict";
    return Controller.extend("org.ubb.books.controller.BookList", {
        onInit: function(){
            this.update = false;
            this.book = {
                ISBN : "",
                Title:"",
                Author:"",
                DatePublished: "",
                Language:"",
                TotalNumber:"",
                AvailableNumber: 0
            }
            if(!this.newBookDialog){
                this.newBookDialog = sap.ui.xmlfragment("org.ubb.books.fragments.insert",this);
                var oModel = new sap.ui.model.json.JSONModel();
                this.newBookDialog.setModel(oModel);
                this.newBookDialog.getModel().setData(this.book);
            }

        },
        onDeleteBook(oEvent){
            const aSelContexts = this.byId("idBooksTable").getSelectedContexts();
            const sBookPath = aSelContexts[0].getPath();
            this.getView().getModel().remove(sBookPath);
        },
        onInsertBook(oEvent){
            sap.ui.getCore().byId("isbnInput").setEnabled(true);
            this.update = false;
            this.book.ISBN = "";
            this.book.Title="",
            this.book.Author="",
            this.book.DatePublished= "",
            this.book.Language="",
            this.book.TotalNumber="",
            this.book.AvailableNumber= 0
            this.newBookDialog.getModel().setData(this.book);
            this.newBookDialog.setModel(this.getView().getModel("i18n"), "i18n");
            this.newBookDialog.open();  
        },
        onUpdateBook(oEvent){
            this.oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            sap.ui.getCore().byId("isbnInput").setEnabled(false);
            this.update=true;
            const aSelContexts = this.byId("idBooksTable").getSelectedContexts();
            if(!aSelContexts[0]){
                MessageToast.show(this.oResourceBundle.getText("errorNoBookSelected"));
            }
            else{
                var selectedBook = aSelContexts[0].getObject();
                var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "dd/MM/yyyy" });
                var dateStrBook = dateFormat.format(new Date(selectedBook.DatePublished));
                this.book = selectedBook;
                this.book.DatePublished = dateStrBook;
                this.newBookDialog.getModel().setData(this.book);
                this.newBookDialog.setModel(this.getView().getModel("i18n"), "i18n");
                this.newBookDialog.open();
                }
        },
        saveBook(oEvent){
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            if(this.update==true){
                const aSelContexts = this.byId("idBooksTable").getSelectedContexts();
                var path = aSelContexts[0].getPath();
                var dateString = this.book.DatePublished;
                var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "dd/MM/yyyy" });
                var TZOffsetMs = new Date(0).getTimezoneOffset()*60*1000;
                var parsedDate = new Date(dateFormat.parse(dateString).getTime() - TZOffsetMs).getTime();
                this.book.DatePublished ="\/Date(" + parsedDate + ")\/";
                var oModel = this.getView().getModel();
                console.log(this.oResourceBundle.getText("appTitle"))
                oModel.update(path, this.book, {
                    success: function(oEvent){
                        MessageToast.show(oResourceBundle.getText("successUpdateRequest"));
                    },
                    error: function(oEvent){
                        console.log(oEvent);
                        var response = oEvent.responseText;
                        var responseObject = JSON.parse(response);
                        var responseErrorText = responseObject.error.innererror.errordetails[0].message;
                        var resultMessage = responseErrorText.substring(12);
                        if(resultMessage == "The number of copies in the library must not be smaller than the number of available copies."){
                            MessageToast.show(oResourceBundle.getText("errorUpdateRequest") + ": " + oResourceBundle.getText("error_number_greater"));
                        }else
                        if(resultMessage == "The Book with the given ISBN has not been found in the database."){
                            MessageToast.show(oResourceBundle.getText("errorUpdateRequest") + ": " + oResourceBundle.getText("error_isbn_not_found"));
                        }else
                        if(resultMessage == "The book could not be updated"){
                            MessageToast.show(oResourceBundle.getText("errorUpdateRequest")+ ": " + oResourceBundle.getText("error_update_error"));
                        }else
                        if(resultMessage == "The Book could not be added in the database."){
                            MessageToast.show(oResourceBundle.getText("errorUpdateRequest")+ ": " + oResourceBundle.getText("error_added_error"));
                        }else
                        if(resultMessage == "The book could not be deleted."){
                            MessageToast.show(oResourceBundle.getText("errorUpdateRequest")+ ": " + oResourceBundle.getText("error_delete_error"));
                        }else{
                            MessageToast.show(oResourceBundle.getText("errorUpdateRequest"));
                        }
                    }
                });
            }
            if(this.update == false){
                var dateString = this.book.DatePublished;
                var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "dd/MM/yyyy" });
                var TZOffsetMs = new Date(0).getTimezoneOffset()*60*1000;
                var parsedDate = new Date(dateFormat.parse(dateString).getTime() - TZOffsetMs).getTime();
                this.book.DatePublished ="\/Date(" + parsedDate + ")\/";
                var oModel = this.getView().getModel();
                oModel.create('/BookEntitySet', this.book, {
                    success: function(){
                        MessageToast.show(oResourceBundle.getText("successCreateRequest"));
                    },
                    error: function(oEvent){
                        console.log(oEvent);
                        var response = oEvent.responseText;
                        var responseObject = JSON.parse(response);
                        var responseErrorText = responseObject.error.innererror.errordetails[0].message;
                        var resultMessage = responseErrorText.substring(12);
                        if(resultMessage == "The number of copies in the library must not be smaller than the number of available copies."){
                            MessageToast.show(oResourceBundle.getText("errorCreateRequest") + ": " + oResourceBundle.getText("error_number_greater"));
                        }else
                        if(resultMessage == "The Book with the given ISBN has not been found in the database."){
                            MessageToast.show(oResourceBundle.getText("errorCreateRequest") + ": " + oResourceBundle.getText("error_isbn_not_found"));
                        }else
                        if(resultMessage == "The book could not be updated"){
                            MessageToast.show(oResourceBundle.getText("errorCreateRequest")+ ": " + oResourceBundle.getText("error_update_error"));
                        }else
                        if(resultMessage == "The Book could not be added in the database."){
                            MessageToast.show(oResourceBundle.getText("errorCreateRequest")+ ": " + oResourceBundle.getText("error_added_error"));
                        }else
                        if(resultMessage == "The book could not be deleted."){
                            MessageToast.show(oResourceBundle.getText("errorCreateRequest")+ ": " + oResourceBundle.getText("error_delete_error"));
                        }else{
                            MessageToast.show(oResourceBundle.getText("errorCreateRequest"));
                        }
                    }
                });
                }
            this.newBookDialog.close();
        },
        closeDialog(oEvent){
            this.newBookDialog.close();
        },
        onBookFilter(oEvent){
            console.log(oEvent);
            var aFilter = [];
            var ISBN = this.byId("isbnInput").getValue();
            var Title = this.byId("titleInput").getValue();
            var Author = this.byId("authorInput").getValue();
            var DateFrom = this.byId("dateFrom").getValue();
            var DateTo = this.byId("dateTo").getValue();
            var Language = this.byId("languageInput").getValue();
            if(ISBN ){
                var filter = new Filter("ISBN",FilterOperator.Contains, ISBN);
                aFilter.push(filter);
            }
            if(Author){
                var filter = new Filter("Author",FilterOperator.Contains, Author);
                aFilter.push(filter);
            }
            if(Title){
                var filter = new Filter("Title",FilterOperator.Contains, Title);
                aFilter.push(filter);
            }
            if(DateFrom && DateTo){
                debugger;
                var filter = new Filter("DatePublished",FilterOperator.BT, DateFrom, DateTo);
                aFilter.push(filter);
            }
            if(Language){
                var filter = new Filter("Language",FilterOperator.Contains, Language);
                aFilter.push(filter);
            }
             var oTable = this.byId("idBooksTable");
             var oBinding = oTable.getBinding("items");
             oBinding.filter(aFilter);


        },
        onSortButtonPressed: function(oEvent) { 
            this._oDialog = sap.ui.xmlfragment("org.ubb.books.fragments.Sorter", this);
            this._oDialog.setModel(this.getView().getModel("i18n"), "i18n");
            this._oDialog.open();
        },
        onConfirm: function(oEvent) {
            var oView = this.getView();
            var oTable = oView.byId("idBooksTable");
            var mParams = oEvent.getParameters();
            var oBinding = oTable.getBinding("items");

            // apply sorter
            var aSorters = [];
            var sPath = mParams.sortItem.getKey();
            var bDescending = mParams.sortDescending;
            aSorters.push(new sap.ui.model.Sorter(sPath, bDescending));
            oBinding.sort(aSorters);

        },
    });
});