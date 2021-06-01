/*
 * @Description: 
 * @Author: zhangchuangye
 * @Date: 2021-06-01 11:34:07
 */
/*
 * @Description: 
 * @Author: zhangchuangye
 * @Date: 2021-06-01 09:29:56
 */
// 伪代码 仅为了练习subtree
function Dialog(type){
    return  new this[type]()
 }
 
 Dialog.prototype.open=function(param){
    this.state='open'
    console.log('hello git subtree')
 }
 
 const pop=new Dialog('open',1)
 console.log(pop.state)
 