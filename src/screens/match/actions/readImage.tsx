import {ImageCropData, NativeModules, Platform} from 'react-native';
import TesseractOcr from 'react-native-tesseract-ocr';
import ImageEditor from '@react-native-community/image-editor';
import RNFS from 'react-native-fs';
import {
  CommonPlayerStats,
  GoalkeeperStats,
  OutfieldPlayerStats,
} from '../../../utils/interface';
const {RNImageOCR} = NativeModules;

export default async function readImage(uri: string, isGK: boolean) {
  let playerStats: OutfieldPlayerStats | GoalkeeperStats = {};

  const sortStats = (data: string[], sectionIndex: number) => {
    const sortPasses = (commonPlayerData: string[]) => {
      let player: CommonPlayerStats = {};

      commonPlayerData.forEach((stat, index) => {
        switch (index) {
          case 0:
            player.assists = Number(stat);
            break;
          case 1:
            player.completedShortPasses = Number(stat);
            break;
          case 2:
            player.completedMediumPasses = Number(stat);
            break;
          case 3:
            player.completedLongPasses = Number(stat);
            break;
          case 4:
            player.failedShortPasses = Number(stat);
            break;
          case 5:
            player.failedMediumPasses = Number(stat);
            break;
          case 6:
            player.failedLongPasses = Number(stat);
            break;
          case 7:
            player.keyPasses = Number(stat);
            break;
          case 8:
            player.successfulCrosses = Number(stat);
            break;
          case 9:
            player.failedCrosses = Number(stat);
        }
      });

      return player;
    };

    const sortPositioning = (commonPlayerData: string[]) => {
      let player: CommonPlayerStats = {};

      commonPlayerData.forEach((stat, index) => {
        switch (index) {
          case 0:
            player.interceptions = Number(stat);
            break;
          case 1:
            player.blocks = Number(stat);
            break;
          case 2:
            player.outOfPosition = Number(stat);
        }
      });

      return player;
    };

    const sortBallRetention = (commonPlayerData: string[]) => {
      let player: CommonPlayerStats = {};

      commonPlayerData.forEach((stat, index) => {
        switch (index) {
          case 0:
            player.possessionWon = Number(stat);
            break;
          case 1:
            player.possessionLost = Number(stat);
            break;
          case 2:
            player.clearances = Number(stat);
            break;
          case 3:
            player.headersWon = Number(stat);
            break;
          case 4:
            player.heardersLost = Number(stat);
        }
      });

      return player;
    };

    if (!isGK) {
      let outfieldPlayer: OutfieldPlayerStats = {};

      switch (sectionIndex) {
        case 0: // Rating
          outfieldPlayer.rating = parseFloat(data[sectionIndex]);
          break;
        case 1: // Shooting
          data.forEach((stat, index) => {
            switch (index) {
              case 0:
                outfieldPlayer.goals = Number(stat);
                break;
              case 1:
                //   const statToNum = parseInt(stat[index], 10);
                outfieldPlayer.shotsOnTarget = Number(stat);
                break;
              case 2:
                outfieldPlayer.shotsOffTarget = Number(stat);
            }
          });
          break;
        case 2: // Passes
          const passes = sortPasses(data);
          outfieldPlayer = {...outfieldPlayer, ...passes};
          break;
        case 3: // Movement
          data.forEach((stat, index) => {
            switch (index) {
              case 0:
                outfieldPlayer.keyDribbles = Number(stat);
                break;
              case 1:
                outfieldPlayer.fouled = Number(stat);
                break;
              case 2:
                outfieldPlayer.successfulDribbles = Number(stat);
            }
          });
          break;
        case 4: //Tackling
          data.forEach((stat, index) => {
            switch (index) {
              case 0:
                outfieldPlayer.wonTackles = Number(stat);
                break;
              case 1:
                outfieldPlayer.lostTackles = Number(stat);
                break;
              case 2:
                outfieldPlayer.fouls = Number(stat);
                break;
              case 3:
                outfieldPlayer.penaltiesConceded = Number(stat);
            }
          });
          break;
        case 5: // Positioning
          const positioning = sortPositioning(data);
          outfieldPlayer = {...outfieldPlayer, ...positioning};
          break;
        case 6: // Ball retention
          const ballRetention = sortBallRetention(data);
          outfieldPlayer = {...outfieldPlayer, ...ballRetention};
      }

      return outfieldPlayer;
    } else {
      let goalkeeper: GoalkeeperStats = {};
      switch (sectionIndex) {
        case 0: // Rating
          goalkeeper.rating = parseFloat(data[sectionIndex]);
          break;
        case 1: // Goalkeeping
          data.forEach((stat, index) => {
            switch (index) {
              case 0:
                goalkeeper.goalsConceded = Number(stat);
                break;
              case 1:
                goalkeeper.shotsCaught = Number(stat);
                break;
              case 2:
                goalkeeper.shotsParried = Number(stat);
                break;
              case 3:
                goalkeeper.crossesCaught = Number(stat);
                break;
              case 4:
                goalkeeper.ballsStriped = Number(stat);
            }
          });
          break;
        case 2: // Passes
          const passes = sortPasses(data);
          goalkeeper = {...goalkeeper, ...passes};
          break;
        case 3: // Positioning
          const positioning = sortPositioning(data);
          goalkeeper = {...goalkeeper, ...positioning};
          break;
        case 4: // Ball retention
          const ballRetention = sortBallRetention(data);
          goalkeeper = {...goalkeeper, ...ballRetention};
      }
      return goalkeeper;
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
        console.log('trimmer', value, valueIndex);
        formattedData.push(value);
      });
    }

    console.log('formatted', formattedData, index);

    if (isGK && index === 3 && formattedData.length === 1) {
      throw new Error(
        'If you played as an outfield player, disable switch in options below.',
      );
    }
    if (!isGK && index === 2 && formattedData.length === 0) {
      throw new Error(
        'If you played as a goalkeeper, enable switch in options below.',
      );
    }

    const sortedData = sortStats(formattedData, index);

    playerStats = {...playerStats, ...sortedData};
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
        offset: {x: 1029, y: 240},
        size: {width: 195, height: 96},
      },
      {
        offset: {x: 802, y: 448},
        size: {width: 120, height: 144},
      },
      {
        offset: {x: 1549, y: 436},
        size: {width: 120, height: 180},
      },
      {
        offset: {x: 1549, y: 652},
        size: {width: 120, height: 72},
      },
      {
        offset: {x: 1549, y: 760},
        size: {width: 120, height: 108},
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
