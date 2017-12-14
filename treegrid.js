const columnsdetail = [
    {key:'id',name:'明细id'},
    {key:'code',name:'明细编码'},
    {key:'name',name:'明细名称'},
    {key:'status',name:'明细状态'},
    {key:'remark',name:'明细备注'},
    ]
//注册定制表格组件
Vue.component("demo-table", {
    template: "#table-template",
    props: ['datalist', 'columns', 'pagination', 'noMoreText'],
    data() {
        return {
            checks: false,//全选
            checkGroup: [],//复选框数组 ids
            dataLength: 0,//树形数据长度
            columnsdetail:[{key:id,name:''}]
        }
    },
    watch: {
        datalist() {
            if (this.datalist) {
                this.dataLength = this.Length(this.datalist)
                this.initData(this.deepCopy(this.datalist), 1, null);
                this.checkGroup = this.renderCheck(this.datalist)
                if (this.checkGroup.length == this.dataLength) {
                    this.checks = true
                } else {
                    this.checks = false
                }
            }
        },
        checkGroup(data) {
            this.checkAllGroupChange(data);
        },
    },
    created() {
        if (this.datalist) {
            this.dataLength = this.Length(this.datalist)
//              this.initData(this.deepCopy(this.datalist), 1, null);
            this.checkGroup = this.renderCheck(this.datalist)
            if (this.checkGroup.length == this.dataLength) {
                this.checks = true
            } else {
                this.checks = false
            }
        }
        this.$data = Object.assign({},this.$data,{"columnsdetail":columnsdetail});
    },
    mounted() {

    },
    methods: {
        // 有无多选框折叠位置优化
        iconRow() {
            for (var i = 0, len = this.columns.length; i < len; i++) {
                if (this.columns[i].type == 'selection') {
                    return 1;
                }
            }
            return 0;
        },
        // 设置td宽度,td的align
        tdStyle(column) {
            var style = {}
            if (column.align) {
                style["text-align"] = column.align;
            }
            if (column.width) {
                style["min-width"] = column.width + 'px';
            }
            return style;
        },
        //全选处理
        handleCheckAll() {
            this.checks = !this.checks;
            if (this.checks) {
                this.checkGroup = this.getArray(this.checkGroup.concat(this.allIds(this.datalist)))
            } else {
                this.checkGroup = []
            }
        },
        checkAllGroupChange(data) {
            if (this.dataLength > 0 && data.length === this.dataLength) {
                this.checks = true;
            } else {
                this.checks = false;
            }
            this.$emit('on-selection-change', this.checkGroup, '[选中数量] ' + data.length + '::[总数量] ' + this.dataLength)
        },
        // 数组去重
        getArray(a) {
            var hash = {},
                len = a.length,
                result = [];
            for (var i = 0; i < len; i++) {
                if (!hash[a[i]]) {
                    hash[a[i]] = true;
                    result.push(a[i]);
                }
            }
            return result;
        },
        //全部数据
        allIds(data) {
            let arr = [];
            data.forEach(function (row) {
                arr.push(row.id);
                /*if (row.children && row.children.length > 0) {
                  row = Object.assign({},row,row.children);
                }*/
            });
            return arr;
        },
        // 返回树形数据长度
        Length(data) {
            let length = data.length;
            /*data.forEach((child) => {
              if (child.children) {
                length += this.Length(child.children)
              }
            })*/
            return length;
        },
        // 数据处理 增加自定义属性监听
        initData(items, level, parent) {
            this.datalist = []
            let spaceHtml = "";
            for (var i = 1; i < level; i++) {
                spaceHtml += "<i class='ms-tree-space'></i>"
            }
            items.forEach((item, index) => {
                if ((typeof item.expanded) == "undefined") {
                    item = Object.assign({}, item, {
                        "expanded": false
                    });
                }
                if ((typeof item.show) == "undefined") {
                    item = Object.assign({}, item, {
                        "isShow": false
                    });
                }
                item = Object.assign({}, item, {
                    "load": (item.expanded ? true : false)
                });
                let exProps = {}
                if (item.children) {
                    spaceHtml += "<i class='ms-tree-space'></i>"
                    item = Object.assign({}, item, {
                        "parent": item,
                        "level": level + 1,
                        "spaceHtml": spaceHtml
                    });
                }
                else {
                    item = Object.assign({}, item, {
                        "parent": parent,
                        "level": level,
                        "spaceHtml": spaceHtml
                    });
                }
                this.datalist.push(item);
            })
        },
        // 深度拷贝函数
        deepCopy(data) {
            var t = this.type(data),
                o, i, ni;
            if (t === 'array') {
                o = [];
            } else if (t === 'object') {
                o = {};
            } else {
                return data;
            }
            if (t === 'array') {
                for (i = 0, ni = data.length; i < ni; i++) {
                    o.push(this.deepCopy(data[i]));
                }
                return o;
            } else if (t === 'object') {
                for (i in data) {
                    o[i] = this.deepCopy(data[i]);
                }
                return o;
            }

        },
        // 默认选中
        renderCheck(data) {
            let arr = []
            data.forEach((item) => {
                if (item._checked) {
                    arr.push(item.id)
                }
            })
            return arr
        },
        // 点击某一行事件
        RowClick(data, event, index, text) {
            let result = this.makeData(data)
            this.$emit('on-row-click', result, event, index, text)
        },
        // 点击事件 返回数据处理
        makeData(data) {
            const t = this.type(data);
            let o;
            if (t === 'array') {
                o = [];
            } else if (t === 'object') {
                o = {};
            } else {
                return data;
            }

            if (t === 'array') {
                for (let i = 0; i < data.length; i++) {
                    o.push(this.makeData(data[i]));
                }
            } else if (t === 'object') {
                for (let i in data) {
                    if (i != 'spaceHtml' && i != 'parent' && i != 'level' && i != 'expanded' && i != 'isShow' && i !=
                        'load') {
                        o[i] = this.makeData(data[i]);
                    }
                }
            }
            return o;
        },
        //  隐藏显示
        toggle(index, item) {
            if (item.children) {
                if (item.expanded) {
                    item.expanded = !item.expanded;
                    //隐藏
                    this.close(index, item)
                } else {
                    //显示
                    item.expanded = !item.expanded;
                    this.open(index, item)
                }
                this.$emit('on-expand-click', JSON.stringify(item))
            }
        },
        open(index, item) {
            // this.$set(item,'isShow',true)
            // item = Object.assign({},item,{"isShow":true});
            item.isShow = true;
        },
        close(index, item) {
            // this.$set(item,'isShow',false)
            // item = Object.assign({},item,{"isShow":false});
            item.isShow = false;
        },
        //对象类型
        type(obj) {
            var toString = Object.prototype.toString;
            var map = {
                '[object Boolean]': 'boolean',
                '[object Number]': 'number',
                '[object String]': 'string',
                '[object Function]': 'function',
                '[object Array]': 'array',
                '[object Date]': 'date',
                '[object RegExp]': 'regExp',
                '[object Undefined]': 'undefined',
                '[object Null]': 'null',
                '[object Object]': 'object'
            };
            return map[toString.call(obj)];
        },
        //获取对象的属性名或属性值
        getObjKV(obj, kv) {
            if (kv === 'key') {
                let arr = Object.keys(obj);
                arr.map(function(k){

                })
                return Object.keys(obj);
            }
            else {
                return Object.values(obj);
            }
        },
    },
    components: {}
});
//注册简单表格组件
//      Vue.componet("simple-table",{"template":"#"});
//注册分页组件
//      Vue.componet("simple-nag",{"template":"#"});
