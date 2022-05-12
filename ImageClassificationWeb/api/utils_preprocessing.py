import base64
import io
import secrets

import numpy as np
from PIL import Image
from cv2 import cvtColor, COLOR_GRAY2BGR
from django.core.files.base import ContentFile
from skimage import img_as_uint
from skimage.filters import threshold_otsu, threshold_local
from skimage.restoration import estimate_sigma, denoise_tv_chambolle, denoise_bilateral, denoise_nl_means


def threshold_to_data_url(result):
    """
    Convert thresholded image to data url
    :param result: threshold result image
    :return: data URL
    """

    result_uint = img_as_uint(result)
    result_uint_3d = cvtColor(result_uint, COLOR_GRAY2BGR)
    image_edited_pil = Image.fromarray(np.uint8(result_uint_3d))
    return get_data_url_from_image(image_edited_pil)


def denoise_to_data_url(result):
    """
    Convert denoised image to data url
    :param result: denoise result image
    :return: data URL
    """
    result_uint = np.uint8(result * 255)
    image_edited_pil = Image.fromarray(result_uint, mode='RGB')
    return get_data_url_from_image(image_edited_pil)


def get_data_url_from_image(image):
    """
    Convert Pillow image to data URL
    :param image: Pillow image
    :return: data URL
    """
    buffered = io.BytesIO()
    image.save(buffered, format="JPEG")
    return 'data:image/jpeg;base64,' + base64.b64encode(buffered.getvalue()).decode("utf-8")


def rgba2rgb(rgba):
    """
    Convert RGBA image to RGB

    Source: https://stackoverflow.com/questions/50331463/convert-rgba-to-rgb-in-python

    :param rgba:  RGBA image
    :return: RGB image
    """
    row, col, ch = rgba.shape

    if ch == 3:
        return rgba

    assert ch == 4, 'RGBA image has 4 channels.'

    rgb = np.zeros((row, col, 3), dtype='float32')
    r, g, b, a = rgba[:, :, 0], rgba[:, :, 1], rgba[:, :, 2], rgba[:, :, 3]

    a = np.asarray(a, dtype='float32') / 255.0

    R, G, B = (255, 255, 255)

    rgb[:, :, 0] = r * a + (1.0 - a) * R
    rgb[:, :, 1] = g * a + (1.0 - a) * G
    rgb[:, :, 2] = b * a + (1.0 - a) * B

    return np.asarray(rgb, dtype='uint8')


def get_image_from_data_url(data_url):
    """
    Convert data URL to ContentFile

    Source: https://dev.to/txiocoder/creating-image-from-dataurl-base64-with-pyhton-django-454g

    :param data_url: image data URL
    :return: image as ContentFile
    """

    _format, _dataurl = data_url.split(';base64,')
    _filename, _extension = secrets.token_hex(20), _format.split('/')[-1]
    file = ContentFile(base64.b64decode(_dataurl), name=f"{_filename}.{_extension}")

    # resize image
    width = 50
    image = Image.open(file)
    image_io = io.BytesIO()
    w_percent = (width / float(image.size[0]))
    h_size = int((float(image.size[1]) * float(w_percent)))
    image = image.resize((width, h_size), Image.ANTIALIAS)
    image.save(image_io, format=_extension)

    return ContentFile(image_io.getvalue(), name=f"{_filename}.{_extension}")


def replace_default(dict_object, dict_key, dtype, default_value):
    """
    Fill objects' parameters if empty

    :param dict_object: object of type dict()
    :param dict_key: object's id
    :param dtype: object's type
    :param default_value: default value
    :return:
    """

    if dict_key not in dict_object.keys() or len(dict_object[dict_key]) == 0:
        return default_value

    if dtype == "int":
        return int(dict_object[dict_key])
    if dtype == "str":
        return str(dict_object[dict_key])
    if dtype == "float":
        return float(dict_object[dict_key])
    if dtype == "bool":
        return eval(dict_object[dict_key].title())


class Preprocessing:
    """ Preprocessing - parent class """
    result = None
    image = None

    def get_result(self):
        return self.result


class DenoiseBilateral(Preprocessing):
    """ Apply bilateral denoise """

    sigma_color = 0.15
    win_size = None
    sigma_spatial = 15
    bins = 10
    bilateral_mode = "constant"

    def __init__(self, image, post):
        self.image = image
        self.sigma_color = replace_default(post, "sigma_color", "float", self.sigma_color)
        self.win_size = replace_default(post, "win_size", "int", self.win_size)
        self.sigma_spatial = replace_default(post, "sigma_spatial", "int", self.sigma_spatial)
        self.bins = replace_default(post, "bins", "int", self.bins)
        self.bilateral_mode = replace_default(post, "bilateral_mode", "str", self.bilateral_mode)
        self.result = denoise_bilateral(self.image, win_size=self.win_size, sigma_color=self.sigma_color,
                                        sigma_spatial=self.sigma_spatial, bins=self.bins, mode=self.bilateral_mode, multichannel=True)

    def __str__(self):
        return f"DenoiseBilateral: sigma_color: {self.sigma_color}, win_size: {self.win_size}, sigma_spatial: {self.sigma_spatial}, " \
               f"bins: {self.bins}, mode: {self.bilateral_mode}"


class DenoiseTvChambolle(Preprocessing):
    """ Apply TvChambolle denoise """

    eps = 0.0002
    n_iter_max = 200
    weight = 0.1

    def __init__(self, image, post):
        self.image = image
        self.eps = replace_default(post, "eps", "float", self.eps)
        self.n_iter_max = replace_default(post, "n_iter_max", "int", self.n_iter_max)
        self.weight = replace_default(post, "weight", "float", self.weight)
        self.result = denoise_tv_chambolle(self.image, eps=self.eps, n_iter_max=self.n_iter_max, weight=self.weight, multichannel=True)

    def __str__(self):
        return f"DenoiseTvChambolle: eps: {self.eps}, n_iter_max: {self.n_iter_max}, weight: {self.weight}"


class DenoiseNlMeans(Preprocessing):
    """ Apply Non-local means denoise """

    patch_size = 5
    patch_distance = 6

    def __init__(self, image, post):
        self.image = image
        self.patch_size = replace_default(post, "patch_size", "int", self.patch_size)
        self.patch_distance = replace_default(post, "patch_distance", "int", self.patch_distance)
        sigma_est = estimate_sigma(self.image, multichannel=True, average_sigmas=True)
        self.result = denoise_nl_means(self.image, patch_size=self.patch_size, patch_distance=self.patch_distance,
                                       h=1 * sigma_est, sigma=sigma_est, fast_mode=True, multichannel=True)

    def __str__(self):
        return f"DenoiseNlMeans: patch_size: {self.patch_size}, patch_distance: {self.patch_distance}"


class ThresholdOtsu(Preprocessing):
    """ Apply Otsu threshold """

    def __init__(self, image):
        self.image = image
        self.result = image > threshold_otsu(image)

    def __str__(self):
        return f"ThresholdOtsu"


class ThresholdAdaptive(Preprocessing):
    """ Apply Adaptive threshold """

    block_size = 35
    method = 'gaussian'
    offset = 0.15
    adapt_mode = "reflect"
    param = None
    cval = 0

    def __init__(self, image, post):
        self.image = image
        self.block_size = replace_default(post, "block_size", "int", self.block_size)
        self.method = replace_default(post, "adapt_method", "str", self.method)
        self.offset = replace_default(post, "offset", "float", self.offset)
        self.adapt_mode = replace_default(post, "adapt_mode", "str", self.adapt_mode)
        self.cval = replace_default(post, "cval", "int", self.cval)

        self.result = image > threshold_local(image, block_size=self.block_size, method=self.method, offset=self.offset, mode=self.adapt_mode,
                                              param=self.param, cval=self.cval)

    def __str__(self):
        return f"ThresholdAdaptive: block_size: {self.block_size}, method: {self.method}, offset: {self.offset}, adapt_mode: {self.adapt_mode}, cval: {self.cval}"
