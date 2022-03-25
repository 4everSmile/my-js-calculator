const input = document.getElementById("input");

const btn0 = document.getElementById("btn0");
const btn1 = document.getElementById("btn1");
const btn2 = document.getElementById("btn2");
const btn3 = document.getElementById("btn3");
const btn4 = document.getElementById("btn4");
const btn5 = document.getElementById("btn5");
const btn6 = document.getElementById("btn6");
const btn7 = document.getElementById("btn7");
const btn8 = document.getElementById("btn8");
const btn9 = document.getElementById("btn9");

const btnC = document.getElementById("btnC");
const btnDot = document.getElementById("btnDot");
const btnAdd = document.getElementById("btnAdd");
const btnSub = document.getElementById("btnSub");
const btnDiv = document.getElementById("btnDiv");
const btnMul = document.getElementById("btnMul");
const btnMod = document.getElementById("btnMod");
const btnExp = document.getElementById("btnExp");
const btnResult = document.getElementById("btnResult");

const setClick = (domElement, clickHandler) => {
  domElement.addEventListener("click", clickHandler);
}

setClick(btn0, () => {
  input.value += "0";
});
setClick(btn1, () => {
  input.value += "1";
});
setClick(btn2, () => {
  input.value += "2";
});
setClick(btn3, () => {
  input.value += "3";
});
setClick(btn4, () => {
  input.value += "4";
});
setClick(btn5, () => {
  input.value += "5";
});
setClick(btn6, () => {
  input.value += "6";
});
setClick(btn7, () => {
  input.value += "7";
});
setClick(btn8, () => {
  input.value += "8";
});
setClick(btn9, () => {
  input.value += "9";
});
setClick(btnDot, () => {
  input.value += ".";
});
setClick(btnAdd, () => {
  input.value += "+";
});
setClick(btnSub, () => {
  input.value += "-";
});
setClick(btnMod, () => {
  input.value += "%";
});
setClick(btnDiv, () => {
  input.value += "/";
});
setClick(btnMul, () => {
  input.value += "*";
});
setClick(btnExp, () => {
  input.value += "**";
});
setClick(btnC, () => {
  input.value = "";
});
setClick(btnResult, () => {
  try {
    input.value = eval(input.value);
  } catch (err) {
    alert(err.message);
  }
});
