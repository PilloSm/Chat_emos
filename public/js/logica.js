var socket = io.connect("http://localhost:8080");
var list = document.querySelector("#lista-users");
var user = document.querySelector("#userName");
var userId = document.querySelector("#userId");
var username = window.location.pathname.replace("/chat/", "");
var clientes = [];

function conectarChat() {
  console.log(clientes);
  var id = socket.id;
  user.innerHTML = username;
  userId.innerHTML = id;
  $.post("/login", { username: username, id: id }, function (data) {
    clientes = data;
    var html = "";
    clientes.forEach(function (cliente) {
      html += "<li>" + cliente.username + "</li>";
    });
    list.innerHTML = html;
    $(".loader").hide();
  });
}
function enviarMensajeClick() {
  enviarMensaje({ which: 13 }); 
}

function enviarMensaje(e) {
  if (e.which !== 13) return;

  var msg = document.querySelector("#input").value;
  if (msg.length <= 0) return;

  $.post(
    "/send",
    {
      text: msg,
      username: username,
      id: socket.id,
    },
    function (data) {
      mostrarGifEnviado(); // Aquí se llama a la función
      document.querySelector("#input").value = "";
    }
  );
}

function mostrarGifEnviado() {
  var loadingContainer = document.getElementById("loading-container");
  loadingContainer.style.display = "flex";

  setTimeout(function () {
    loadingContainer.style.display = "none";
  }, 1000); // Ocultar el gif después de 1 segundo
}

socket.on("mensaje", function (data) {
  data.username = data.username.replace("</", "");
  var sanitized = data.msg.replace(/<\/?[^>]+(>|$)/g, "").trim();

  if (sanitized.length === 0) {
    return;
  }

  var fecha = new Date();
  var hora = fecha.getHours();
  var minutos = fecha.getMinutes();

  // Formato de 24 horas
  var horaFormateada = `${hora < 10 ? "0" + hora : hora}:${
    minutos < 10 ? "0" + minutos : minutos
  }`;

  if (data.id == socket.id) {
    var msj = `
    <div class="local-message">
      <strong>${data.username}</strong>
      <p>${insertarSaltosDeLinea(sanitized)}</p>
      <p id="date-message">${horaFormateada} </p>
    </div>
    `;
    document.querySelector(".mensajes-container").innerHTML += msj;
  } else {
    var msj = `
    <div class="remote-message">
      <strong>${data.username} </strong>
      <p>${insertarSaltosDeLinea(sanitized)}</p>
      <p id="date-message"><strong id="idUsaerin">${horaFormateada}</p>
    </div>
    `;
    document.querySelector(".mensajes-container").innerHTML += msj;
  }

  var mensajesContainer = document.querySelector(".text-container");
  mensajesContainer.scrollTop = mensajesContainer.scrollHeight;
});

socket.on("socket_desconectado", function (data) {
  clientes = clientes.filter(function (cliente) {
    return cliente.id != data.id;
  });
  var html = "";
  clientes.forEach(function (cliente) {
    html += "<li>" + cliente.username + "</li>";
  });
  list.innerHTML = html;
});

socket.on("socket_conectado", function (data, id) {
  clientes.push(data);
  var html = "";
  clientes.forEach(function (cliente) {
    html += "<li>" + cliente.username + "</li>";
  });

  var inputElement = document.querySelector("#input");
  inputElement.addEventListener("input", function () {
    var inputValue = inputElement.value.trim();

    if (inputValue.length > 0) {
      socket.emit("notificar", data);
    } else {
    }
  });

  list.innerHTML = html;
});

socket.on("notify", (id) => {
  // Puedes agregar lógica aquí para manejar la notificación sin usar modales
});

document.addEventListener("DOMContentLoaded", function () {
  // Puedes agregar lógica aquí si es necesario
});

function insertarSaltosDeLinea(texto) {
  const longitudLinea = 50;
  let resultado = "";

  for (let i = 0; i < texto.length; i += longitudLinea) {
    resultado += texto.substr(i, longitudLinea) + "<br>";
  }

  return resultado;
}
