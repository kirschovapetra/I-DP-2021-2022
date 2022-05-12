import json
import os
import cv2
import pandas as pd
from PIL import Image, ImageOps

IMAGES_PATH = "tmp/images"


class Shape:
    """
    Shape of a cutout

    Attributes

    ----------

    * x: x coord of top left corner
    * y: y coord of top left corner
    * width: width of shape
    * height: height of shape
    """

    def __init__(self, x: float, y: float, width: float, height: float):
        self.x = x
        self.y = y
        self.width = width
        self.height = height


def clear_folder(dirname: str):
    """
    Clear contents of a folder
    :param dirname: name of the root directory
    """

    if os.path.exists(dirname):
        for the_file in os.listdir(dirname):
            file_path = os.path.join(dirname, the_file)
            try:
                if os.path.isfile(file_path):
                    os.unlink(file_path)
                else:
                    clear_folder(file_path)
                    os.rmdir(file_path)
            except Exception as e:
                print(e)


def init_folder(path):
    """
    Initialize folder
    :param path: path to directory
    """
    if not os.path.exists(path):
        os.mkdir(path)

    clear_folder(path)


def cut_images(root_dir, suffix=""):
    """
    Parse csv export and cut images
    :param root_dir: root directory
    :param suffix: suffix to add at the end of the file name
    """
    df = pd.read_csv(os.path.join(root_dir, f'{root_dir}_csv.csv'))
    df = df[['filename', 'region_shape_attributes', 'region_attributes']]
    df = df[df['region_attributes'] != "{}"]

    df_fin = pd.DataFrame({'filename': df['filename']})

    df_fin['class'] = df.apply(lambda x: json.loads(x['region_attributes'])['class'], axis=1)

    shapes = []
    for row in df['region_shape_attributes']:
        obj = json.loads(row)
        shapes.append(Shape(int(obj['x']), int(obj['y']),
                            int(obj['width']), int(obj["height"])))

    df_fin['shape'] = shapes

    df_fin = df_fin.sort_values('class')

    cut_images_path = os.path.join(root_dir, 'cut_images')
    init_folder(cut_images_path)

    # loop over df
    i = 0
    last_class = ""
    for index, cutout in df_fin.iterrows():

        cur_class = cutout['class']
        fname = cutout['filename']

        # coords
        left = cutout['shape'].x
        top = cutout['shape'].y
        right = left + cutout['shape'].width
        bottom = top + cutout['shape'].height

        if cur_class != last_class:
            last_class = cur_class
            i = 0

        class_folder_path = os.path.join(cut_images_path, cur_class)
        if not os.path.exists(class_folder_path):
            os.mkdir(class_folder_path)

        try:
            # crop out the cutout
            im = Image.open(os.path.join(IMAGES_PATH, fname))
            im = ImageOps.exif_transpose(im)
            im = im.crop((left, top, right, bottom))
            path = os.path.join(class_folder_path, f'{cur_class}_{i}{suffix}_{fname}.jpg')
            im.save(path)
            # load and save with cv2
            image_cv2 = cv2.imread(path)
            result = cv2.imwrite(path, image_cv2)
            print(fname, "Success" if result else "Fail")
        except Exception as ex:
            print(fname, f"Fail ({ex})")
        i += 1

    print("\nCropped images saved to " + cut_images_path)


if __name__ == '__main__':
    # crop out images from "tmp/images/low_quality_images_csv.csv"
    cut_images('low_quality_images', '_b')
    # crop out images from "tmp/images/special_chars_csv.csv"
    cut_images('special_chars')
