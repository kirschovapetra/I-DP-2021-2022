from classes.cnn.SupervisedModel import SupervisedModel
from general import *


class PretrainedModel(SupervisedModel):
    """
    Pretrained cnn model for image classification

    Attributes

    ----------

    * name : Model name
    * weights_dir : base directory for trained model weights
    * dirname : subdirectory name for trained model weights
    * filename : filename for trained model weights
    * base_model : keras model pretrained on imagenet weights (ResNet50 / ResNeXt50 / InceptionV3 / VGG19)
    * batch_size : batch size
    * epochs : number of epochs
    * lr : learning rate
    * img_size : image size (height, width)
    * out_shape : output shape, number of output classes
    * checkpoint : number of epoch from which to run callback
    * dataset : dataset name ('vega', 'dida' or 'mnist')
    """

    base_model: Model = None

    def __init__(self, name: str = None, weights_dir: str = None, dirname: str = None, filename: str = None,
                 base_model: Model = None, batch_size: int = 50, epochs: int = 10, lr: int = 0.0001,
                 img_size: tuple = (32, 32), out_shape: int = None, checkpoint: int = None, dataset: str = None) -> None:
        super().__init__(name=name, weights_dir=weights_dir, dirname=dirname, filename=filename, batch_size=batch_size,
                         epochs=epochs, lr=lr, img_size=img_size, checkpoint=checkpoint, dataset=dataset)

        self.base_model = base_model
        self._build(self.base_model.input, out_shape)

    def _predict(self, *args):
        pass

    def _build(self, in_shape: tuple, out_shape: int):
        """
        Build pretrained model

        :param in_shape: input image shape (height, with, n_channels)
        :param out_shape: output shape, number of output classes
        """

        x = self.base_model.output
        x = layers.Flatten(name="flatten")(x)
        x = layers.BatchNormalization()(x)
        x = layers.Dense(256, activation='relu',
                         kernel_regularizer='l1')(x)
        x = layers.Dropout(rate=0.5, seed=123)(x)
        output = layers.Dense(out_shape, activation='softmax', name="output")(x)
        self.model = Model(inputs=in_shape, outputs=output)
        self.model.compile(tf.optimizers.Adam(learning_rate=self.lr), loss='categorical_crossentropy', metrics=['accuracy'])
