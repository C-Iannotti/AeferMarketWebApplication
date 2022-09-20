import tensorflow as tf
from collections import OrderedDict

class MLModel:
    BATCH_SIZE = 256

    def map_func(self, x, class_):
        od_ = OrderedDict()
        od_["lstm_input"] = tf.reshape(tf.stack(list(x.values())), (-1, 1, len(list(x.values()))))
        class_ = tf.reshape(class_, (-1, 1, 1))
        return (od_, class_)

    def __init__(self, conn=None, first_model=False):
        if first_model:
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
            self.train_model(25)
        else:
            model = tf.keras.models.load_model("model/model.h5")
            self.model = model

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

        train_acc, valid_acc = self.train_model(25)
        return train_acc, valid_acc

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

        print("Here")

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
        return train_acc, valid_acc