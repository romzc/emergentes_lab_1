const appState = {
  takingPicture: false,
  savingPicture: false,
  imageUri: "",
};


const APP_KEY = "fdsgesfgfdhn"

const app = {
  initialize: function () {
    document.addEventListener(
      "deviceready",
      this.onDeviceReady.bind(this),
      false
    );
  },
  onDeviceReady: function () {
    this.receivedEvent("deviceready");
  },

  receivedEvent: function (id) {
    const closeButton = document.getElementById("close_photo_button");
    const takeButton = document.getElementById("take_photo_button");
    const discardButton = document.getElementById("discard_photo_button");

    takeButton.addEventListener("click", () => {
      if (!appState.savingPicture && !appState.takingPicture) takePhoto();
      else savePhoto();
    });

    discardButton.addEventListener("click", discardPhoto);

    closeButton.addEventListener("click", closeApp);
  },
};

app.initialize();


function closeApp() {
  navigator.app.exitApp();
}

/**
 * Funcion: Descartamos la imagen, la funcion se invoca cuando el usuario
 * presiona el boton descartar.
 */
function discardPhoto() {
  document.getElementById("take_photo_button").textContent = "Tomar Foto";
  appState.savingPicture = false;
  document.getElementById("picture_result").src = "";
  // Elimina la dirección almacenada en el localStorage
  localStorage.removeItem(APP_KEY);
}

function savePhoto() {
  if (!appState.savingPicture) return;

  const sourceImageUri = appState.imageUri;
  const destinationDirectory = cordova.file.dataDirectory;

  const randomNumber = Math.floor(Math.random() * 90000) + 1000;
  const destinationFilename = `${randomNumber}.jpg`;

  // Crear la carpeta "images" dentro de cordova.file.dataDirectory
  resolveLocalFileSystemURL(destinationDirectory, function (dirEntry) {
    dirEntry.getDirectory('images', { create: true }, function (imagesDirEntry) {
      // Ahora tenemos acceso a la carpeta "images"
      // Copiar la imagen a la carpeta "images"
      resolveLocalFileSystemURL(sourceImageUri, function (fileEntry) {

        fileEntry.copyTo(imagesDirEntry, destinationFilename, function (newFileEntry) {
          alert("Imagen guardada con éxito...");
          //console.log("Imagen guardada en: " + newFileEntry.nativeURL);
          localStorage.setItem(APP_KEY, newFileEntry.nativeURL)
          appState.savingPicture = false;
          appState.imageUri = newFileEntry.nativeURL
          document.getElementById("take_photo_button").textContent = "Tomar Foto";
          document.getElementById("picture_result").src = appState.imageUri;
        }, onError);
      }, onError);
    }, onError);
  }, onError);

  return;
}

function onError(error) {
  alert("Error al guardar imagen");
  appState.savingPicture = false;
}

/**
 * Funcion: Inicia la camara y en caso de tener exito o no, ejecuta
 * las funcion callback que se envian segun sea el caso.
 * @returns void
 */
function takePhoto() {
  appState.takingPicture = !appState.takingPicture;
  if (!appState.takingPicture) return;
  navigator.camera.getPicture(onSucces, onFail, {
    quality: 50,
    destinationType: Camera.DestinationType.FILE_URI,
    encodingType: Camera.EncodingType.JPEG
  });
}

/**
 * Funcion: Altera el estado de la aplicación, habilita la opcion de guardado.
 * Esta funcion se invoca cuando se tomo la photo y se renderiza en el contenedor
 * respectivo.
 * @param {string} imageUri
 */
function onSucces(imageUri) {
  console.log(imageUri);
  appState.takingPicture = false;
  appState.savingPicture = true;
  appState.imageUri = imageUri;
  document.getElementById("picture_result").src = imageUri;
  document.getElementById("take_photo_button").textContent = "Guardar";
}

function onFail(error) {
  appState.takingPicture = false;
  document.getElementById("take_photo_button").textContent = "Tomar Foto";
  alert(error);
}
