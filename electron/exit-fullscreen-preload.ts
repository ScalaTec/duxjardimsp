import { contextBridge, ipcRenderer } from 'electron';

// Unica coisa que o botao de saida da tela cheia da Maquete pode fazer.
contextBridge.exposeInMainWorld('exitFullscreen', () => ipcRenderer.send('maquete:exit-fullscreen'));
