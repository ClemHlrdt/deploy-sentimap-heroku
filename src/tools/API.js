const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api/tweets"
    : "https://sentimap-nodejs-api.herokuapp.com/api/tweets";

export function getLocation() {
  return new Promise(resolve => {
    navigator.geolocation.getCurrentPosition(
      position => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      () => {
        console.log("resolving call to api...");
        resolve(
          fetch("https://ipapi.co/json")
            .then(res => res.json())
            .then(location => {
              return {
                lat: location.latitude,
                lng: location.longitude
              };
            })
        );
      }
    );
  });
}

export function getTweets(data) {
  //let data = { topic, count, latitude, longitude, radius };
  console.log(API_URL, data);
  return fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    redirect: "follow",
    body: JSON.stringify(data)
  });
}
