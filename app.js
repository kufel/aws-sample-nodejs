import express from "express";
import createError from "http-errors";
import logger from "morgan";
import timeout from "connect-timeout";
import { performance } from "perf_hooks";

const port = 4232;
const app = express();
const env = process.env.NODE_ENV || "development";

app.use(timeout("10s"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger("dev"));

app.get("/ping", (req, res) => {
  return res.send("pong");
});

app.get("/isprime/:num", haltOnTimedout, function (req, res, next) {
  console.log("Processing request...");
  console.log("Num: ", req.params.num);
  const startTime = performance.now();
  const { isPrime, factors } = isPrimeNum(req.params.num);
  const endTime = performance.now();
  const execTime = Number(endTime - startTime).toFixed(2);
  console.log(`Exec time: ${execTime} milliseconds`);
  res.json({
    isPrime,
    factors,
    execTime,
  });
});

app.get("/cpuslow/:num", haltOnTimedout, function (req, res, next) {
  const num = parseInt(req.params.num);
  console.log("Num: ", num);
  cpuIntensiveFun(req.params.num);
  res.sendStatus(200);
});

function isPrimeNum(num) {
  const factors = [];
  if (num < 1) return false;
  if (num === 1) return true;
  for (let i = 2; i < num; i++) {
    if (num % i === 0) {
      factors.push(i);
    }
  }
  return { num, factors, isPrime: !(factors.length > 0) };
}

function cpuIntensiveFun(baseNum) {
  console.time("cpuIntensiveFun");
  let result = 0;
  for (var i = Math.pow(baseNum, 7); i >= 0; i--) {
    result += Math.atan(i) * Math.tan(i);
  }
  console.timeEnd("cpuIntensiveFun");
  console.log(result);
  return result;
}

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

function haltOnTimedout(req, res, next) {
  if (!req.timedout) next();
}

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = env === "development" ? err : {};

  if (res.headersSent) {
    return next(err);
  }
  res.json({
    error: err?.status || 500,
    message: err?.message || "Some internal error occured",
  });
});

app.listen(port, () => {
  console.log("App running on port " + port);
});
