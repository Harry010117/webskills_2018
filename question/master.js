
class core{
    constructor(){
    }

    setDB(){
        var store;
        const req = indexedDB.open("20180813", 14);

        return new Promise (function(resolve){
            req.onupgradeneeded = function(e){
                this.db = e.target.result;
                store = this.db.createObjectStore("list", {autoIncrement:true});
                store.createIndex("transaction", "transaction", {unique : false});
                store.createIndex("card", "card", {unique : false});
                store.createIndex("more", "more", {unique : false});
                this.store = store;
           
            }

            req.onsuccess = function(e){
                this.db = e.target.result;

                resolve();
            }
        });
    }

    getTable(table){
        console.log(this.db);
        // return this.res = this.db.transaction([table], 'readwrite').objectStore(table)
    }

    insert(option){
        console.log(this.db);
        this.getTable(option.table)
        // var test = this.getTable("Fasdfads");
    }
}


const db = new core();
db.setDB()
.then(function(){ db.insert( {table: 'list'} )  });



