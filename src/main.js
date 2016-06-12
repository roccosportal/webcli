var webcli = {
  commands : {}
};
// try to make it chrome compatible
if(typeof browser === 'undefined'){
  browser = chrome;
}
