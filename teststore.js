/* Isolate ScoreTool storage when this build is served from /test/, so the live app's
   tester data on the same GitHub Pages origin is never read or written.
   Local tests (pathname "/") and the live root app are unchanged. */
(function(){
  try{
    if(!/\/test(\/|$)/.test(String(location.pathname||''))) return;
    var P='sttest.';
    var proto=Storage.prototype;
    var rawGet=proto.getItem, rawSet=proto.setItem, rawRm=proto.removeItem, rawKey=proto.key, rawClear=proto.clear;
    var lenDesc=Object.getOwnPropertyDescriptor(proto,'length');
    var rawLen=function(store){return lenDesc&&lenDesc.get?lenDesc.get.call(store):store.length};
    var isLS=function(s){try{return s===window.localStorage}catch(e){return false}};
    var mapped=function(k){k=String(k==null?'':k);return k.indexOf(P)===0?k:P+k};
    proto.getItem=function(k){return rawGet.call(this,isLS(this)?mapped(k):k)};
    proto.setItem=function(k,v){return rawSet.call(this,isLS(this)?mapped(k):k,v)};
    proto.removeItem=function(k){return rawRm.call(this,isLS(this)?mapped(k):k)};
    proto.key=function(i){
      if(!isLS(this))return rawKey.call(this,i);
      var ks=[],j,k,n=rawLen(this);
      for(j=0;j<n;j++){k=rawKey.call(this,j);if(k&&k.indexOf(P)===0)ks.push(k.slice(P.length))}
      return i>=0&&i<ks.length?ks[i]:null;
    };
    proto.clear=function(){
      if(!isLS(this))return rawClear.call(this);
      var drop=[],j,k,n=rawLen(this);
      for(j=0;j<n;j++){k=rawKey.call(this,j);if(k&&k.indexOf(P)===0)drop.push(k)}
      for(j=0;j<drop.length;j++)rawRm.call(this,drop[j]);
    };
    if(lenDesc&&lenDesc.get){
      Object.defineProperty(proto,'length',{configurable:true,enumerable:lenDesc.enumerable,get:function(){
        if(!isLS(this))return rawLen(this);
        var n=0,j,k,N=rawLen(this);
        for(j=0;j<N;j++){k=rawKey.call(this,j);if(k&&k.indexOf(P)===0)n++}
        return n;
      }});
    }
    window.__ST_TEST_STORE=P;
  }catch(e){}
})();
