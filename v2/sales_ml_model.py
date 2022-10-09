import tensorflow as tf
import numpy as np
from collections import OrderedDict
from models import ModelWeights
from datetime import datetime

# A class for creating and manipulating
# a machine learning model used in the
# prediction of sales.
class MLModel:
    BATCH_SIZE = 256

    # inputs x, class_
    #
    # A mapping function for taking a TensorFlow dataset
    # and formatting it to match the classes functions.
    def map_func(self, x, class_):
        od_ = OrderedDict()
        od_["lstm_input"] = tf.reshape(tf.stack(list(x.values())), (-1, 1, len(list(x.values()))))
        class_ = tf.reshape(class_, (-1, 1, 1))
        return (od_, class_)
    
    # inputs: first_model
    #
    # Initialies the machine learning model by
    # retrieving a local copy and putting it into
    # memory. Unless first_model is true, then it
    # creates a new model.
    def __init__(self, first_model=False):
        if first_model:
            model = tf.keras.models.Sequential([
                tf.keras.layers.LSTM(units=30, input_shape=(1, 24), return_sequences=True, name="lstm"),
                tf.keras.layers.Dense(units=1, name="dense"),
                tf.keras.layers.Reshape([1,-1])
            ])
            loss = tf.keras.losses.MeanSquaredError()
            optimizer = tf.keras.optimizers.RMSprop(learning_rate=0.0005)
            metrics = [tf.keras.metrics.CategoricalCrossentropy(), tf.keras.metrics.MeanSquaredError()]
            model.compile(
                optimizer=optimizer,
                loss=loss,
                metrics=metrics
            )
            self.model = model
        else:
            model = tf.keras.models.load_model("model/model.h5")
            self.model = model
    
    # inputs: weights
    #
    # Takes weights and assigns each of them
    # to a layer for a newly created model that
    # is then used for the class's functions.
    def set_model(self, weights):
        model = tf.keras.models.Sequential([
            tf.keras.layers.LSTM(
                units=30,
                input_shape=(1, 24),
                return_sequences=True,
                name="lstm"),
            tf.keras.layers.Dense(
                units=1,
                name="dense"
                ),
            tf.keras.layers.Reshape([1,-1])
        ])
        loss = tf.keras.losses.MeanSquaredError()
        optimizer = tf.keras.optimizers.RMSprop(learning_rate=0.0005)
        metrics = [tf.keras.metrics.CategoricalCrossentropy(), tf.keras.metrics.MeanSquaredError()]
        model.compile(
            optimizer=optimizer,
            loss=loss,
            metrics=metrics
        )

        i = 0
        if i+3 <= len(weights):
            model.get_layer("lstm").set_weights(weights=[np.asarray(weights[i]), np.asarray(weights[i+1]), np.asarray(weights[i+2])])
        i += 3

        if i+2 <= len(weights):
            model.get_layer("dense").set_weights(weights=[np.asarray(weights[i]), np.asarray(weights[i+1])])
        i += 2

        self.model = model
        self.model.save("model/model.h5")

    # returns: new_model, train_acc, valid_acc
    #
    # Creates a new model and trains it for 25 epochs
    # on the model data locally stored. The model is
    # then used for the class's functions.
    def remake_model(self):
        model = tf.keras.models.Sequential([
            tf.keras.layers.LSTM(units=30, input_shape=(1, 24), return_sequences=True, name="lstm"),
            tf.keras.layers.Dense(units=1),
            tf.keras.layers.Reshape([1,-1])
        ])
        loss = tf.keras.losses.MeanSquaredError()
        optimizer = tf.keras.optimizers.RMSprop(learning_rate=0.0005)
        metrics = [tf.keras.metrics.CategoricalCrossentropy(), tf.keras.metrics.MeanSquaredError()]
        model.compile(
            optimizer=optimizer,
            loss=loss,
            metrics=metrics
        )
        self.model = model

        new_model, train_acc, valid_acc = self.train_model(25)
        return new_model, train_acc, valid_acc

    # returns: new_model, train_acc, valid_acc
    #
    # Retrieves current model and trains it for a number
    # of epochs on the model data locally stored. The
    # model is then used for the class's functions.
    def train_model(self, epochs):
        train_ds = tf.data.experimental.make_csv_dataset(
            "model/train_data.csv",
            batch_size=self.BATCH_SIZE,
            num_epochs=1,
            ignore_errors=True,
            label_name="Class"
        )

        valid_ds = tf.data.experimental.make_csv_dataset(
            "model/valid_data.csv",
            batch_size=self.BATCH_SIZE,
            num_epochs=1,
            ignore_errors=True,
            label_name="Class"
        )
        
        train_ds = train_ds.map(self.map_func)
        valid_ds = valid_ds.map(self.map_func)

        self.model.fit(x=train_ds, epochs=epochs, batch_size=self.BATCH_SIZE)
        self.model.save("model/model.h5")

        num_accur_train = 0
        total_train = 0
        for batch in train_ds:
            res = self.model(batch[0]["lstm_input"])
            num_accur_train += int(tf.reduce_sum(tf.cast(tf.equal(tf.cast(tf.round(res), tf.int32), batch[1]), tf.int32)))
            total_train += int(tf.shape(batch[1])[0])

        num_accur_valid = 0
        total_valid = 0
        for batch in valid_ds:
            res = self.model(batch[0]["lstm_input"])
            num_accur_valid += int(tf.reduce_sum(tf.cast(tf.equal(tf.cast(tf.round(res), tf.int32), batch[1]), tf.int32)))
            total_valid += int(tf.shape(batch[1])[0])

        train_acc = num_accur_train / total_train
        valid_acc = num_accur_valid / total_valid

        model_weights = self.model.get_weights()
        for i in range(len(model_weights)):
            model_weights[i] = model_weights[i].tolist()

        new_model = ModelWeights(
            timestamp=datetime.now(),
            layer_1= model_weights[0] if 0 < len(model_weights) else None,
            layer_2= model_weights[1] if 1 < len(model_weights) else None,
            layer_3= model_weights[2] if 2 < len(model_weights) else None,
            layer_4= model_weights[3] if 3 < len(model_weights) else None,
            layer_5= model_weights[4] if 4 < len(model_weights) else None,
        )

        return new_model, train_acc, valid_acc