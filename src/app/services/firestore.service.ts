import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class FirebaseStorageService {

  constructor(
    private storage: AngularFireStorage
  ) { }

  //Tarea para subir archivo
  public uploadFile(filename: string, data: any, userId: string, route?: string) {
    const storageReference = this.storage.ref(route || `images/${userId}/${filename}`);
    const customMetadata = {
      name: filename,
      contentType: data.type
    }
    return storageReference.put(data, customMetadata);
  }

  //Referencia del archivo
  public getReferenceFromFilename(filename: string, userId: string, route?: string) {
    return this.storage.ref(route || `images/${userId}/${filename}`);
  }

  // Elimina una o todas las fotos de la ruta
  public removePhotos (userId: string, adId: string) {
    return new Promise((res, rej) => {
      this.storage.ref(`images/${userId}/${adId}`).listAll().toPromise()
        .then((listResults) => {
          const promises = listResults.items.map((item) => {
            return item.delete();
          });
          Promise.all(promises)
            .then((values) => {
              res(true);
            })
            .catch((err) => {
              rej(err);
            })
        });
    })
  }

  public removeProfilePhoto (userId: string) {
    return new Promise((res, rej) => {
      this.storage.ref(`images/${userId}/profileImage`).listAll().toPromise()
        .then((listResults) => {
          const promises = listResults.items.map((item) => {
            return item.delete();
          });
          Promise.all(promises)
            .then((values) => {
              res(true);
            })
            .catch((err) => {
              rej(err);
            })
        });
    })
  }
}