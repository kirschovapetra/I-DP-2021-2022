from classes.cnn.SupervisedModel import SupervisedModel
from general import *


class CustomModel(SupervisedModel):
    """
    Custom cnn model for image classification

    Attributes

    ----------

    * name : Model name ('VGG19', 'ResNeXt50', 'ResNet50', 'InceptionV3' or 'Custom')
    * weights_dir : base directory for trained model weights
    * dirname : subdirectory name for trained model weights
    * filename : filename for trained model weights
    * batch_size : batch size
    * epochs : number of epochs
    * lr : learning rate
    * img_size : image size (height, width)
    * out_shape : output shape, number of output classes
    * checkpoint : number of epoch from which to run callback
    * dataset : dataset name ('vega', 'dida' or 'mnist')
    """

    def __init__(self, name: str = None, weights_dir: str = None, dirname: str = None, filename: str = None,
                 batch_size: int = 50, epochs: int = 10, lr: int = 0.0001, img_size: tuple = (32, 32),
                 out_shape: int = None, checkpoint: int = None, dataset: str = None) -> None:
        super().__init__(name=name, weights_dir=weights_dir, dirname=dirname, filename=filename, batch_size=batch_size,
                         epochs=epochs, lr=lr, img_size=img_size, checkpoint=checkpoint, dataset=dataset)

        self._build(img_size + (3,), out_shape)

    def _predict(self, *args):
        pass

    def _build(self, in_shape: tuple, out_shape: int):
        """
        Build custom model

        :param in_shape: input image shape (height, with, n_channels)
        :param out_shape: output shape, number of output classes
        """

        input_layer = layers.Input(shape=in_shape, name="input")
        x = layers.Conv2D(32, kernel_size=4, activation='relu', name="convolution_1")(input_layer)
        x = layers.MaxPooling2D(pool_size=(2, 2), name="max_pooling_1")(x)
        x = layers.Conv2D(16, kernel_size=4, activation='relu', name="convolution_2")(x)
        x = layers.MaxPooling2D(pool_size=(2, 2), name="max_pooling_2")(x)
        x = layers.Flatten(name="flatten")(x)
        x = layers.Dense(10, activation='relu', name="fully_connected")(x)
        output = layers.Dense(out_shape, activation='softmax', name="output")(x)

        self.model = Model(inputs=input_layer, outputs=output)
        self.model.compile(tf.optimizers.Adam(learning_rate=self.lr), loss='categorical_crossentropy', metrics=['accuracy'])
