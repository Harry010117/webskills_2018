
// 클래스
class core{
    constructor(){
    }

    setDB(){
        var store;

        // indexeddb 만들기
        const req = indexedDB.open("20180813", 14);
        const _this = this;

        // 비동기
        return new Promise (function(resolve){
            // indexeddb 버전 업그레이드 할때
            req.onupgradeneeded = function(e){
                _this.db = e.target.result;
                store = _this.db.createObjectStore("list", {autoIncrement:true});
                _this.store = store;
            }


            // indexeddb 연결 성공햇을때
            req.onsuccess = function(e){
                _this.db = e.target.result;
                // console.log(_this.db);

                resolve(_this.db);
            }
        });
    }

    getTable(table){
        // console.log(this.db);
        return this.res = this.db.transaction([table], 'readwrite').objectStore(table);
    }

    getJsonData(data){
        json.Parse()
    }


    // indexeddb에 값넣을때
    dbCommand(type, option){
        switch(type):
            case "insert":
                const res =  this.getTable(option.table).add(option.column);
                return new Promise(function(resolve){res.ounsuccess = resolve});
            break;

            case "update":
                const res = this.getTable(option.table).put(option.column)
                return new Promise(resolve => { res.onsuccess = resolve })
            break;

            case "delete":
                const res = this.getTable(option.table).delete(option.idx)
                return new Promise(resolve => { res.onsuccess = resolve })
            break;

            case "fetch":
                const res = this.getTable(option.table).getAll()
                return new Promise(resolve => resolve && (res.onsuccess = resolve));
            break;
    }
}



// 
const db = new core();
db.setDB();



