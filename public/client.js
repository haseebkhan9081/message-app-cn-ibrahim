const socket = io();

const form = document.getElementById("send-container");
const messageInput = document.getElementById("messageInp");
const messageContainer = document.querySelector(".container");
const ting = new Audio("assets/ting.mp3");
const loginSound = new Audio("assets/login.mp3");
let username = "";

do {
  username = prompt("Enter name to login");
  if (username === null || username === "") {
    console.log("Oh ho Re enter name");
  }
} while (username === "" || username === null);
centerMessaging("You joined");
// loginSound.play();
socket.emit("new-user-joined", username);

socket.on("user-joined", (uname) => {
  centerMessaging(`${uname} joined the chat`);
});

// Your code to handle sending messages and appending them to the message container

function appendMessage(message, position) {
  const messageElement = document.createElement("div");
  messageElement.innerText = message;
  messageElement.classList.add("message");
  messageElement.classList.add(position);
  messageContainer.append(messageElement);
}

function centerMessaging(message) {
  const centerElement = document.createElement("div");
  centerElement.innerText = message;
  centerElement.classList.add("center");
  messageContainer.append(centerElement);
}

socket.on("recieve-message", (data) => {
  appendMessage(` ${data.username} : ${data.message}`, "left");
  ting.play();
});

socket.on("userLeft", (username) => {
  centerMessaging(`${username} left the chat`, "right");
});

const fileselected = document.getElementById("file-upload");
fileselected.addEventListener("change", (event) => {
  console.log("when input changes",event.target.files)
  if (fileselected.files.length > 0) {
    document.getElementById("file-upload").classList.add("fileColor");
  } else {
    document.getElementById("file-upload").classList.remove("fileColor");
  }
});

form.addEventListener("submit", (event) => {
  // Prevent the default form submission behavior
  event.preventDefault();

  // Retrieve the text from the input field
  const message = messageInput.value.trim();

  // extracting file
  const fileInput = document.getElementById("file-upload");

  if (message != "" || (fileInput && fileInput.files.length > 0)) {
    // if there is only message
    if (fileInput.files.length === 0) {
      console.log("Message:", message);
      appendMessage(` ${message}`, "right");
      socket.emit("send-message", message);
      messageInput.value = "";
    }

    // if there is only file
    else if (message === null || message === "") {
      const file = fileInput.files[0];
      console.log("received file", file.name);
      const link = document.createElement("a");
      link.classList.add("message");
      link.classList.add("right");
      link.href = file.data;
      link.download = file.name;
      link.innerHTML = file.name;
      document.body.appendChild(link);
      messageContainer.append(link);
      readFile(file);
      fileInput.value='';
      event.preventDefault();
    }

    // if both messages and files are loaded
    else {
      // first send message
      appendMessage(` ${message}`, "right");
      socket.emit("send-message", message);
      messageInput.value = "";
      // now send the file document
      const file = fileInput.files[0];
      console.log("received file", file.name);
      const link = document.createElement("a");
      link.classList.add("message");
      link.classList.add("right");
      link.href = file.data;
      link.download = file.name;
      link.innerHTML = file.name;
      document.body.appendChild(link);
      messageContainer.append(link);

      readFile(file);
      file.value("");
    }
  }
});

function readFile(file) {
  const reader = new FileReader();
  reader.onload = function (event) {
    const data = event.target.result;
    console.log("file reader",file)
    socket.emit("file", {name:file.name,data:data});
  };
  reader.readAsDataURL(file);
}

socket.on("file", (file) => {
  console.log("received file", file);
  const link = document.createElement("a");
  link.classList.add("message");
  link.classList.add("left");
console.log("file info",file)
    link.href = file.data;
  link.download = file.name;
  link.innerHTML = file.name;
  document.body.appendChild(link);
  messageContainer.append(link);
});
