import {ImageCropData, NativeModules, Platform} from 'react-native';
import TesseractOcr from 'react-native-tesseract-ocr';
import ImageEditor from '@react-native-community/image-editor';
import RNFS from 'react-native-fs';
import {GoalkeeperStats, OutfieldPlayerStats} from '../../../utils/interface';
const {RNImageOCR} = NativeModules;

export default async function readImage(uri: string, isGK: boolean) {
  let playerStats = {} as OutfieldPlayerStats & GoalkeeperStats;

  const sortStats = (data: string, sectionIndex: number) => {
    if (!isGK) {
      switch (sectionIndex) {
        case 0: // Rating
          playerStats.rating = parseFloat(data);
          break;
        case 1:
          playerStats.goals = Number(data);
          break;
        case 2:
          playerStats.assists = Number(data);
          break;
        case 3:
          playerStats.shots = Number(data);
          break;
        case 4:
          playerStats.shotsAccuracy = Number(data);
          break;
        case 5:
          playerStats.passes = Number(data);
          break;
        case 6:
          playerStats.passAccuracy = Number(data);
          break;
        case 7:
          playerStats.dribbles = Number(data);
          break;
        case 8:
          playerStats.dribblesSuccessRate = Number(data);
          break;
        case 9:
          playerStats.tackles = Number(data);
          break;
        case 10:
          playerStats.tackleSuccessRate = Number(data);
          break;
        case 11:
          playerStats.offsides = Number(data);
          break;
        case 12:
          playerStats.fouls = Number(data);
          break;
        case 13:
          playerStats.possessionWon = Number(data);
          break;
        case 14:
          playerStats.possessionLost = Number(data);
          break;
        case 15:
          playerStats.minutesPlayed = Number(data);
          break;
        case 16:
          playerStats.distanceCovered = parseFloat(data);
          break;
        case 17:
          playerStats.distanceSprinted = parseFloat(data);
      }
    } else {
      switch (sectionIndex) {
        case 0: // Rating
          playerStats.rating = parseFloat(data);
          break;
        case 1:
          playerStats.shotsAgainst = Number(data);
          break;
        case 2:
          playerStats.shotsOnTarget = Number(data);
          break;
        case 3:
          playerStats.saves = Number(data);
          break;
        case 4:
          playerStats.goalsConceded = Number(data);
          break;
        case 5:
          playerStats.saveSuccessRate = Number(data);
          break;
        case 6:
          playerStats.shootoutSaves = Number(data);
          break;
        case 7:
          playerStats.shootoutGoalsConceded = Number(data);
          break;
      }
    }
  };

  const postOCR = (result: string, index: number) => {
    let convertedData: string[] = [];
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

      if (Platform.OS === 'ios') {
        if ((result[i] === '' || result[i] === '\n') && val !== '') {
          convertedData.push(val);
          val = '';
        }
      } else {
        if (
          (result[i] === '' || result[i] === '\n' || result.length - 1 === i) &&
          val !== ''
        ) {
          convertedData.push(val);
          val = '';
        }
      }
    }

    let formattedData: string[] = [];
    for (let i = 0; i < convertedData.length; i++) {
      let trimmed = convertedData[i].split('/');
      trimmed.map((value, valueIndex) => {
        // FIX OUTPUT
        if (isGK && index === 2 && valueIndex === 2 && value >= '13') {
          console.log('fixed', value, valueIndex);
          return formattedData.push('0');
        }
        if (index === 0 && valueIndex === 0 && parseFloat(value) > 10) {
          console.log('fixed', value, valueIndex);
          return formattedData.push('6.3');
        }
        //   console.log('trimmer', value, valueIndex);
        formattedData.push(value);
      });
    }

    console.log('formatted', formattedData[0], index);

    if (isGK && index === 4 && Number(formattedData[0]) > 10) {
      throw new Error(
        'If you played as an outfield player, disable switch in options below.',
      );
    }
    if (!isGK && !formattedData[0]) {
      throw new Error(
        'If you played as a goalkeeper, enable switch in options below.',
      );
    }

    sortStats(formattedData[0], index);
  };

  const getTextFromImageAndroid = async (croppedUri: string, index: number) => {
    const tessOptions = {
      allowlist: '1234567890/.',
      denylist: null,
    };
    const strippedUri = croppedUri.replace('file://', '');

    try {
      const ocr = await TesseractOcr.recognize(strippedUri, 'eng', tessOptions);
      postOCR(ocr, index);
    } catch (error) {
      throw Error(error.message);
    }
  };

  const getTextFromImageIos = async (croppedUri: string, index: number) => {
    try {
      const readFile = await RNFS.readFile(croppedUri, 'base64');
      const base64 = 'data:image/png;base64,' + readFile;
      const ocr = await RNImageOCR.recognize(base64);
      postOCR(ocr, index);
    } catch (error) {
      throw Error(error.message);
    }
  };

  const cropImage = async (cropData: ImageCropData, index: number) => {
    try {
      const editImage = await ImageEditor.cropImage(uri, cropData);
      if (Platform.OS === 'ios') {
        await getTextFromImageIos(editImage, index);
      } else {
        await getTextFromImageAndroid(editImage, index);
      }
    } catch (error) {
      throw Error(error.message);
    }
  };

  let cropData: ImageCropData[] = [];
  if (!isGK) {
    cropData = [
      {
        //Rating
        offset: {x: 554, y: 216},
        size: {width: 60, height: 48},
      },
      {
        // Goals
        offset: {x: 1710, y: 291},
        size: {width: 75, height: 36},
      },
      {
        // Assist
        offset: {x: 1710, y: 330},
        size: {width: 75, height: 36},
      },
      {
        // Shots
        offset: {x: 1710, y: 369},
        size: {width: 75, height: 36},
      },
      {
        // Shot accuracy %
        offset: {x: 1710, y: 408},
        size: {width: 75, height: 36},
      },
      {
        // Passes
        offset: {x: 1710, y: 447},
        size: {width: 75, height: 36},
      },
      {
        // Pass Accuracy %
        offset: {x: 1710, y: 486},
        size: {width: 75, height: 36},
      },
      {
        // Dribbles
        offset: {x: 1710, y: 525},
        size: {width: 75, height: 36},
      },
      {
        // Dribble Success Rate %
        offset: {x: 1710, y: 564},
        size: {width: 75, height: 36},
      },
      {
        // Tackles
        offset: {x: 1710, y: 603},
        size: {width: 75, height: 36},
      },
      {
        // Tackle Success Rate %
        offset: {x: 1710, y: 642},
        size: {width: 75, height: 36},
      },
      {
        // Offsides
        offset: {x: 1710, y: 681},
        size: {width: 75, height: 36},
      },
      {
        // Fouls Commited
        offset: {x: 1710, y: 720},
        size: {width: 75, height: 36},
      },
      {
        // Possesion won
        offset: {x: 1710, y: 759},
        size: {width: 75, height: 36},
      },
      {
        // Possesion Lost
        offset: {x: 1710, y: 798},
        size: {width: 75, height: 36},
      },
      {
        // Minutes Played
        offset: {x: 1710, y: 837},
        size: {width: 75, height: 36},
      },
      {
        // Distance Covered
        offset: {x: 1710, y: 876},
        size: {width: 75, height: 36},
      },
      {
        // Distance Sprinted
        offset: {x: 1710, y: 915},
        size: {width: 75, height: 36},
      },
    ];
  } else {
    cropData = [
      {
        //Rating
        offset: {x: 554, y: 216},
        size: {width: 60, height: 48},
      },
      {
        //Shots against
        offset: {x: 1754, y: 328},
        size: {width: 75, height: 36},
      },
      {
        //Shots on target
        offset: {x: 1754, y: 368},
        size: {width: 75, height: 36},
      },
      {
        //Saves
        offset: {x: 1754, y: 407},
        size: {width: 75, height: 36},
      },
      {
        //Goals conceded
        offset: {x: 1754, y: 446},
        size: {width: 75, height: 36},
      },
      {
        //save success rate
        offset: {x: 1754, y: 485},
        size: {width: 75, height: 36},
      },
      {
        //Shootout saves
        offset: {x: 1754, y: 524},
        size: {width: 75, height: 36},
      },
      {
        //Shootout goals conceded
        offset: {x: 1754, y: 563},
        size: {width: 75, height: 36},
      },
    ];
  }

  for (const [index, data] of Object.entries(cropData)) {
    try {
      await cropImage(data, Number(index));
    } catch (error) {
      throw Error(error.message);
    }
  }

  return playerStats;
}
