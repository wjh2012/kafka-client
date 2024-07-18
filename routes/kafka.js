const {Kafka} = require("kafkajs");
const express = require("express");
var router = express.Router();

// Kafka 설정
const kafka = new Kafka({
  clientId: 'express-app',
  brokers: ['ggomg.duckdns.org:59094', 'ggomg.duckdns.org:59095', 'ggomg.duckdns.org:59096']
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'express-group' });

// Kafka 프로듀서 연결
async function connectProducer() {
  await producer.connect();
}

// Kafka 컨슈머 연결 및 메시지 처리
async function connectConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'test', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        partition,
        topic,
        offset: message.offset,
        value: message.value.toString(),
      });
    },
  });
}

// Kafka 연결 초기화
connectProducer();
connectConsumer();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/send', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).send('Message is required');
  }

  await producer.send({
    topic: 'test',
    messages: [{ value: message }],
  });
  res.send('Message sent to Kafka');
});

module.exports = router;
