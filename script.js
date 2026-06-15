function updateTime() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  document.getElementById('time').textContent = `${h}:${m}:${s}`;
  //get hours, minutes, seconds
  //format them as HH:MM:SS
  //set #time elemet's text contents
}

function updateGreeting() {
  const hour = new Date().getHours();
  let greet;
  if (hour <12) greet = 'good morning nyan';
  else if (hour <17) greet = 'good afternoon nyan';
  else greet = 'good evening nyan';
  document.getElementById('greeting').textContent = greet;
  //set greeting according to the time
}

//run on load
updateTime();
updateGreeting();

//update with seconds
setInterval(updateTime, 1000);
