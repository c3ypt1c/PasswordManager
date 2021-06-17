let prefix = "dist/"
let items = ["Account.js", ];
let insertID = "scripts";

function loadScripts() {
  let insertObject = document.getElementById(insertID);

  if(insertObject == null) throw "insertObject is null! Specify a better insertID";

  for(let i=0; i < items.length; i++) {
    let script = document.createElement("script");
    script.src = prefix + items[i];
    insertObject.appendChild(script);
  }
}
