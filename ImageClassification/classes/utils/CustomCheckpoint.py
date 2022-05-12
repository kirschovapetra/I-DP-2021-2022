from keras import callbacks


class CustomCheckpoint(callbacks.ModelCheckpoint):
    """
    Custom checkpoint callback

    Attributes

    ----------

    * checkpoint : number of epoch from which to run callback
    """

    checkpoint: int = 20

    def __init__(self, checkpoint: int, *args, **kwargs):
        self.checkpoint = checkpoint
        super(CustomCheckpoint, self).__init__(*args, **kwargs)

    def on_epoch_end(self, epoch: int, logs=None):
        """invoke ModelCheckpoint callback"""
        if epoch >= self.checkpoint:
            super(CustomCheckpoint, self).on_epoch_end(epoch, logs)
