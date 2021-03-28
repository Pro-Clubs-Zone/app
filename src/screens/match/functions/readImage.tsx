import {ImageCropData, NativeModules, Platform} from 'react-native';
import RNTesseractOcr from 'react-native-tesseract-ocr';
import ImageEditor from '@react-native-community/image-editor';
import RNFS from 'react-native-fs';
const {RNImageOCR} = NativeModules;

export default async function readImage(uri: string, isGK: boolean) {
  const getTextFromImageIos = async (croppedUri: string, index: number) => {
    //  let imgUri = 'file:///' + croppedUri.replace('file://', '');
    await RNFS.readFile(croppedUri, 'base64').then(async (res) => {
      const base64 = 'data:image/png;base64,' + res;
      await RNImageOCR.recognize(base64)
        .then((result) => {
          console.log('ocr result', result);
          let arr = [];
          let val = '';
          for (let i = 0; i < result.length; i++) {
            if (result[i] !== ' ' && result[i] !== '\n' && result[i] !== '↵') {
              if (result[i] === 'D' || result[i] === 'U' || result[i] === '—') {
                val = val + '0';
              } else if (result[i] === 'S') {
                val = val + '5';
              } else {
                val = val + result[i];
              }
            }

            if ((result[i] === '' || result[i] === '\n') && val !== '') {
              arr.push(val);
              val = '';
            }
          }

          let arrr = [];
          for (let i = 0; i < arr.length; i++) {
            let adata = arr[i].split('/');
            adata.map((obj) => {
              arrr.push(obj);
            });
          }
          console.log('ocr ready', arrr);

          // const tempData = _.cloneDeep(this.state.ocrDATA);
          // tempData[index] = arrr;
          // this.setState({ocrDATA: tempData});

          /*this.state.ocrDATA.map((obj, index) => {
              if (obj === undefined) {
                return null;
              } else {
                this.setState({ loading: false });
              }
            });

            console.log("ARRAY-INDEX: ", index, this.state.ocrDATA);*/
        })
        .catch((err) => {
          console.log('OCR Error: ', err);
        });
    });
    // await ImageStore.getBase64ForTag(
    //   successURI,
    //   (resppp) => {
    //     let str = 'data:image/png;base64,' + resppp;
    //     this.getTextFromImageIos(str, index);
    //   },
    //   (error) => {
    //     console.log('cropImage to data,', error);
    //   },
    // );
  };

  const cropImage = async (cropData: ImageCropData, index: number) => {
    await ImageEditor.cropImage(uri, cropData)
      .then(async (successURI) => {
        console.log('succesrUri', successURI);

        if (Platform.OS === 'ios') {
          await getTextFromImageIos(successURI, index);
        }
        //   else {
        //     this.getTextFromImageAndroid(successURI, index);
        //   }
      })
      .catch((error) => console.log('Error caught in this.cropImage:', error));
  };

  let scale = 1920 / 1920;
  // let cropProfile = {
  //   offset: {x: 585 / scale, y: 235 / scale},
  //   size: {width: 166 / scale, height: 166 / scale},
  // };

  // this.cropProfileIMG(cropProfile);

  let cropData: ImageCropData[] = [];
  if (!isGK) {
    cropData = [
      {
        offset: {x: 1029 / scale, y: 240 / scale},
        size: {width: 195 / scale, height: 96 / scale},
      },
      {
        offset: {x: 802 / scale, y: 484 / scale},
        size: {width: 120 / scale, height: 72 / scale},
      },
      {
        offset: {x: 802 / scale, y: 592 / scale},
        size: {width: 120 / scale, height: 180 / scale},
      },
      {
        offset: {x: 802 / scale, y: 808 / scale},
        size: {width: 120 / scale, height: 108 / scale},
      },
      {
        offset: {x: 1549 / scale, y: 484 / scale},
        size: {width: 120 / scale, height: 108 / scale},
      },
      {
        offset: {x: 1549 / scale, y: 628 / scale},
        size: {width: 120 / scale, height: 72 / scale},
      },
      {
        offset: {x: 1549 / scale, y: 736 / scale},
        size: {width: 120 / scale, height: 108 / scale},
      },
    ];
  } else {
    cropData = [
      {
        offset: {x: 1029 / scale, y: 240 / scale},
        size: {width: 195 / scale, height: 96 / scale},
      },
      {
        offset: {x: 802 / scale, y: 448 / scale},
        size: {width: 120 / scale, height: 144 / scale},
      },
      {
        offset: {x: 1549 / scale, y: 436 / scale},
        size: {width: 120 / scale, height: 180 / scale},
      },
      {
        offset: {x: 1549 / scale, y: 652 / scale},
        size: {width: 120 / scale, height: 72 / scale},
      },
      {
        offset: {x: 1549 / scale, y: 760 / scale},
        size: {width: 120 / scale, height: 108 / scale},
      },
    ];
  }

  cropData.map((data, index) => {
    cropImage(data, index);
  });
}
