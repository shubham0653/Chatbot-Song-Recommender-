// services/songService.js

const songMap = {
  sad: [
    // 90s
    { title: "Pehla Nasha", url: "https://www.youtube.com/watch?v=2Nh-cBRHmYk" },
    { title: "Tujhe Dekha To", url: "https://www.youtube.com/watch?v=7kW7z8mF8b8" },

    // 2000s
    { title: "Kal Ho Naa Ho", url: "https://www.youtube.com/watch?v=rzkAGMOKzPk" },
    { title: "Tum Se Hi", url: "https://www.youtube.com/watch?v=cKuXLFWoYE0" },

    // 2010s
    { title: "Tum Hi Ho", url: "https://www.youtube.com/watch?v=Umqb9KENgmk" },
    { title: "Channa Mereya", url: "https://www.youtube.com/watch?v=284Ov7ysmfA" },
    { title: "Agar Tum Saath Ho", url: "https://www.youtube.com/watch?v=sK7riqg2mr4" },

    // 2020s
    { title: "Raataan Lambiyan", url: "https://www.youtube.com/watch?v=gvyUuxdRdR4" },
    { title: "Kesariya", url: "https://www.youtube.com/watch?v=BddP6PYo2gs" }
  ],

  happy: [
    // 90s
    { title: "Ole Ole", url: "https://www.youtube.com/watch?v=V2GZ9uM1k7Y" },

    // 2000s
    { title: "Kajra Re", url: "https://www.youtube.com/watch?v=0G2VxhV_gXM" },

    // 2010s
    { title: "Badtameez Dil", url: "https://www.youtube.com/watch?v=II2EO3Nw4m0" },
    { title: "Gallan Goodiyan", url: "https://www.youtube.com/watch?v=WCsJpDsHY-Q" },
    { title: "Kar Gayi Chull", url: "https://www.youtube.com/watch?v=NTHz9ephYTQ" },

    // 2020s
    { title: "Naatu Naatu", url: "https://www.youtube.com/watch?v=OsU0CGZoV8E" },
    { title: "Jhoome Jo Pathaan", url: "https://www.youtube.com/watch?v=IdBxaO5j73M" }
  ],

  angry: [
    { title: "Zinda", url: "https://www.youtube.com/watch?v=zGF2yNfHiAA" },
    { title: "Kar Har Maidaan Fateh", url: "https://www.youtube.com/watch?v=4er7MkEnFes" },
    { title: "Apna Time Aayega", url: "https://www.youtube.com/watch?v=jFGKJBPFdUA" },
    { title: "Lakshya Title Track", url: "https://www.youtube.com/watch?v=7Zp1f9b9o2Q" }
  ],

  neutral: [
    // 90s
    { title: "Ek Ladki Ko Dekha", url: "https://www.youtube.com/watch?v=9hZ9k2bZc6g" },

    // 2000s
    { title: "Kahin To Hogi Woh", url: "https://www.youtube.com/watch?v=hZWy4xK2n6U" },

    // 2010s
    { title: "Iktara", url: "https://www.youtube.com/watch?v=0VO_b6MtROI" },
    { title: "Kho Gaye Hum Kahan", url: "https://www.youtube.com/watch?v=Z-ZBvEBTf6A" },

    // 2020s
    { title: "Shayad", url: "https://www.youtube.com/watch?v=Y6yKKhYgxNw" },
    { title: "Tere Vaaste", url: "https://www.youtube.com/watch?v=4q4BNnEHFnA" }
  ]
};

// 🎯 Shuffle
const shuffle = (arr) => [...arr].sort(() => 0.5 - Math.random());

// 🎧 Get one song
const getOneSong = (emotion) => {
  const songs = songMap[emotion] || songMap.neutral;
  return shuffle(songs)[0];
};

module.exports = { getOneSong };