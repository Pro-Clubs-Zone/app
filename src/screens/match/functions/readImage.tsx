import {ImageCropData, NativeModules, Platform} from 'react-native';
import RNTesseractOcr from 'react-native-tesseract-ocr';
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

  const getTextFromImageIos = async (croppedUri: string, index: number) => {
    //  let statSection: string[][] = [];
    //  let imgUri = 'file:///' + croppedUri.replace('file://', '');
    await RNFS.readFile(croppedUri, 'base64').then(async (res) => {
      const base64 = 'data:image/png;base64,' + res;
      await RNImageOCR.recognize(base64)
        .then((result: string) => {
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

            if ((result[i] === '' || result[i] === '\n') && val !== '') {
              convertedData.push(val);
              val = '';
            }
          }

          let formattedData: string[] = [];
          for (let i = 0; i < convertedData.length; i++) {
            let trimmed = convertedData[i].split('/');
            trimmed.map((obj) => {
              formattedData.push(obj);
            });
          }
          console.log('formatted', formattedData);
          const sortedData = sortStats(formattedData, index);

          playerStats = {...playerStats, ...sortedData};
        })
        .catch((err) => {
          console.log('OCR Error: ', err);
        });
    });
  };

  const cropImage = async (cropData: ImageCropData, index: number) => {
    await ImageEditor.cropImage(uri, cropData)
      .then(async (successURI) => {
        if (Platform.OS === 'ios') {
          await getTextFromImageIos(successURI, index);
        }
        //   else {
        //     this.getTextFromImageAndroid(successURI, index);
        //   }
      })
      .catch((error) =>
        console.log('Error caught while cropping stats', error),
      );
  };

  let cropData: ImageCropData[] = [];
  if (!isGK) {
    cropData = [
      {
        offset: {x: 1029, y: 240},
        size: {width: 195, height: 96},
      },
      {
        offset: {x: 802, y: 484},
        size: {width: 120, height: 72},
      },

      {
        offset: {x: 802, y: 592},
        size: {width: 120, height: 180},
      },
      {
        offset: {x: 802, y: 808},
        size: {width: 120, height: 108},
      },
      {
        offset: {x: 1549, y: 484},
        size: {width: 120, height: 108},
      },
      {
        offset: {x: 1549, y: 628},
        size: {width: 120, height: 72},
      },
      {
        offset: {x: 1549, y: 736},
        size: {width: 120, height: 108},
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
    await cropImage(data, Number(index));
  }

  return playerStats;
}
