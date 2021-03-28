#import "RNImageOCR.h"
#import "GPUImage.h"
#import <tesseract-objc/Tesseract.h>

@implementation RNImageOCR

RCT_EXPORT_MODULE()
RCT_EXPORT_METHOD(recognize:(nonnull NSString*)path
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  Tesseract *tesseract = [[Tesseract alloc] initWithLanguage:@"eng"];
  NSData * imageData = [[NSData alloc] initWithContentsOfURL: [NSURL URLWithString: path]];
  UIImage *originImg = [UIImage imageWithData:imageData];
  
  UIImage *textTemp = [self convertImageToGrayScale:originImg];
  NSLog(@"*** START ***");
  [tesseract recognize:textTemp
        withCompletion:^(NSString * _Nullable result) {
          NSLog(@"completion block: %@", result);
          resolve([NSString stringWithFormat:@"%@", result]);
          // reject(@"no_events", @"There were no events", error);
          NSLog(@"*** END *** %@", result);
        }
                cancel:^BOOL(NSInteger words, NSInteger progress) {
                  NSLog(@"cancel block: words - %zd, progress - %zd", words, progress);
                  return NO;
                }];
}

// #IMAGE CONVERT into BLACK AND WHITE# //
- (UIImage *)convertImageToGrayScale:(UIImage *)image
{
  // Create image rectangle with current image width/height
  CGRect imageRect = CGRectMake(0, 0, image.size.width, image.size.height);
  
  // Grayscale color space
  CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceGray();
  
  // Create bitmap content with current image size and grayscale colorspace
  CGContextRef context = CGBitmapContextCreate(nil, image.size.width, image.size.height, 8, 0, colorSpace, kCGImageAlphaNone);
  
  // Draw image into current context, with specified rectangle
  // using previously defined context (with grayscale colorspace)
  CGContextDrawImage(context, imageRect, [image CGImage]);
  
  // Create bitmap image info from pixel data in current context
  CGImageRef imageRef = CGBitmapContextCreateImage(context);
  
  // Create a new UIImage object
  UIImage *newImage = [UIImage imageWithCGImage:imageRef];
  
  // Release colorspace, context and bitmap information
  CGColorSpaceRelease(colorSpace);
  CGContextRelease(context);
  CFRelease(imageRef);
  
  // Return the new grayscale image
  return newImage;
}

@end
