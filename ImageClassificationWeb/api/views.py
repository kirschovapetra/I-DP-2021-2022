import json

import numpy as np
from PIL import Image
from django.http import JsonResponse
from django.shortcuts import render
from django.views import View
from skimage import img_as_float
from skimage.color import rgba2rgb

from api.models import BaggingModel, BoostingModel, CnnModel, StackingModel, TwoStepModel
from api.utils import MlMethod, DenoiseMode, ThresholdMode
from api.utils_bagging import Bagging
from api.utils_boosting import Boosting
from api.utils_cnn import Cnn
from api.utils_preprocessing import DenoiseBilateral, denoise_to_data_url, DenoiseTvChambolle, DenoiseNlMeans, get_image_from_data_url, ThresholdOtsu, threshold_to_data_url, ThresholdAdaptive
from api.utils_stacking import Stacking
from api.utils_two_step import TwoStep


class Index(View):
    """ Base view for index page """
    def get(self, request, ml_method=None):
        return render(request=request, template_name='index.html')


class GetModels(View):
    """ View for reading models from db """

    def get(self, request, ml_method):
        """
        Get models from db - GET
        :param request: GET request
        :param ml_method: Machine lerning method (cnn/bagging/boosting/stacking/two-step)
        :return:
        """
        result = []
        if ml_method == MlMethod.CNN.value:
            result = list(CnnModel.get_all_values())
        elif ml_method == MlMethod.BAGGING.value:
            result = list(BaggingModel.get_titles_distinct())
        elif ml_method == MlMethod.BOOSTING.value:
            result = list(BoostingModel.get_all_values())
        elif ml_method == MlMethod.STACKING.value:
            result = list(StackingModel.get_titles_distinct())
        elif ml_method == MlMethod.TWO_STEP.value:
            result = list(TwoStepModel.get_titles_distinct())

        return JsonResponse(result, safe=False)


class PredictConsumer(View):
    """ View for obtaining predictions for single/multi images """

    def post(self, request, ml_method, pred_method):
        """
        Predict labels - POST method
        :param request: POST request
        :param ml_method: Machine lerning method (cnn/bagging/boosting/stacking/two-step)
        :param pred_method: Prediction method (single/multi)
        :return:
        """
        try:
            post = request.POST
            results, pred_list, classes, id_list = json.dumps([]), json.dumps([]), json.dumps([]), json.dumps([])

            # choose which method will be used for prediction
            if ml_method == MlMethod.CNN.value:
                results, pred_list, classes, id_list = Cnn.predict(post, pred_method)
            elif ml_method == MlMethod.BAGGING.value:
                results, pred_list, classes, id_list = Bagging.predict(post, pred_method)
            elif ml_method == MlMethod.BOOSTING.value:
                results, pred_list, classes, id_list = Boosting.predict(post, pred_method)
            elif ml_method == MlMethod.STACKING.value:
                results, pred_list, classes, id_list = Stacking.predict(post, pred_method)
            elif ml_method == MlMethod.TWO_STEP.value:
                results, pred_list, classes, id_list = TwoStep.predict(post, pred_method)

            return JsonResponse({'results': results, 'pred_list': pred_list, 'classes': classes, 'id_list': id_list})
        except Exception as e:
            print("Predict exception: ", str(e))
            return JsonResponse({'results': json.dumps([]), 'pred_list': json.dumps([]), 'classes': json.dumps([]), 'id_list': json.dumps([])})


class Denoise(View):
    """ Denoise image """

    mode = DenoiseMode.NONE_DEN.value

    def post(self, request):
        """
        Read and denoise input image - POST method
        :param request: POST request
        :return: denoised image
        """

        # read data from POST request
        post = request.POST
        self.mode = post['denoise_mode']
        image_orig = post['image']

        # read image from data url
        file = get_image_from_data_url(data_url=image_orig)
        image_float = img_as_float(np.asarray(Image.open(file)))
        image_edited = None

        try:
            image_float = rgba2rgb(image_float)
        except:
            pass

        try:
            # choose denoise method
            if self.mode == DenoiseMode.NONE_DEN.value:
                image_edited = image_orig

            if self.mode == DenoiseMode.BILATERAL.value:
                result = DenoiseBilateral(image_float, post).get_result()
                image_edited = denoise_to_data_url(result)

            elif self.mode == DenoiseMode.TV_CHAMBOLLE.value:
                result = DenoiseTvChambolle(image_float, post).get_result()
                image_edited = denoise_to_data_url(result)

            elif self.mode == DenoiseMode.NL_MEANS.value:
                result = DenoiseNlMeans(image_float, post).get_result()
                image_edited = denoise_to_data_url(result)

            return JsonResponse({'image_edited': image_edited})

        except Exception as e:
            print("Denoise exception: ", str(e))
            return JsonResponse({'image_edited': image_orig})


class Threshold(View):
    """ Apply threshold on image """

    mode = ThresholdMode.NONE_THR.value

    def post(self, request):
        """
        Read and apply threshold on the input image - POST method
        :param request: POST request
        :return: thresholded (binarized) image
        """

        # read data from POST request
        post = request.POST
        self.mode = post['threshold_mode']
        image = post['image']

        try:
            # read image from data url
            file = get_image_from_data_url(data_url=image)
            imgGray = np.asarray(Image.open(file).convert('L'))
            image_edited = None

            # choose threshold method
            if self.mode == ThresholdMode.NONE_THR.value:
                image_edited = image

            elif self.mode == ThresholdMode.OTSU.value:
                result = ThresholdOtsu(imgGray).get_result()
                image_edited = threshold_to_data_url(result)

            elif self.mode == ThresholdMode.ADAPTIVE.value:
                result = ThresholdAdaptive(imgGray, post).get_result()
                image_edited = threshold_to_data_url(result)

            return JsonResponse({'image_edited': image_edited})

        except Exception as e:
            print("Threshold exception: ", str(e))
            return JsonResponse({'image_edited': image})
