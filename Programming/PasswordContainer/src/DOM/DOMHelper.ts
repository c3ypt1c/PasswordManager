let $ = (id : string) => { // Get element function that handles null
  let element = document.getElementById(id)
  if(element == null) throw id + " is null!";
  return element;
 };

 let $$ = (ids : string[]) => { //Get a list of elements
   let elementList = [];
   for(let element = 0; element < ids.length; element++) elementList.push($(ids[element]));
   return elementList;
 }

function disableStatus(l: HTMLInputElement[], status: boolean) {
  for(let i = 0; i < l.length; i++) l[i].disabled = status;
}

function goTo(url: string) {
  document.location.href = url;
}


export {$, $$, disableStatus, goTo, };
