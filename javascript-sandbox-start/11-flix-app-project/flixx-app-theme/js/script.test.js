/**
 * @jest-environment jsdom
 */

import "whatwg-fetch";

const {
  getLocalPage,
  doFetchPopularMovies,
  doFetchPopularTvShows,
  doFetchMovieDetails,
  doFetchTvShowDetails,
  getProductionIdFromLocation,
  getDisplayUsDollars} = require("./script");

let fetchSpy;

beforeEach(() => {
  jest.restoreAllMocks();
  fetchSpy = jest.spyOn(global, "fetch").mockImplementation(() => {});
});

test.each([
  {
    locationPathname: "/javascript-sandbox/app-project/index.html",
    localPage: "index.html"
  },
  {
    locationPathname: "/index.html",
    localPage: "index.html"
  },
  {
    locationPathname: "/",
    localPage: ""
  },
  {
    locationPathname: "",
    localPage: ""
  }
])("should return '$localPage' when getCurrentLocalPage('$locationPathname') is invoked", ({locationPathname, localPage}) => {
  expect(getLocalPage(locationPathname)).toBe(localPage);
});

describe("doFetchPopularMovies", () => {
  beforeEach(() => {
    mockPopularMoviesResponse();
  });

  test("should call the correct Web API", async () => {
    await doFetchPopularMovies("bearer_token");

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.themoviedb.org/3/movie/popular?language=en-GB&page=1&region=GB",
      {
        headers: {
          accept: "application/json",
          Authorization: "Bearer bearer_token"
        }
      }
    );
  });

  test("should return the list of popular movies", async () => {
    const movies = await doFetchPopularMovies("bearer_token");
    expect(movies).toStrictEqual(testData.popularMovies);
  });
});

describe("doFetchPopularTvShows", () => {
  beforeEach(() => {
    mockPopularTvShowsResponse();
  });

  test("should call the correct Web API", async () => {
    await doFetchPopularTvShows("bearer_token");

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.themoviedb.org/3/tv/popular?language=en-GB&page=1",
      {
        headers: {
          accept: "application/json",
          Authorization: "Bearer bearer_token"
        }
      }
    );
  });

  test("should return the list of popular TV shows", async () => {
    const tvShows = await doFetchPopularTvShows("bearer_token");
    expect(tvShows).toStrictEqual(testData.popularTvShows);
  });
});

describe("doFetchMovieDetails", () => {
  beforeEach(() => {
    mockMovieDetailsResponse();
  });

  test("should call the correct Web API", () => {
    doFetchMovieDetails("bearer_token", 42);

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.themoviedb.org/3/movie/42?language=en-GB",
      {
        headers: {
          accept: "application/json",
          Authorization: "Bearer bearer_token"
        }
      }
    );
  });

  test("should return the movie details", async () => {
    const movieDetails = await doFetchMovieDetails("bearer_token", 42);
    expect(movieDetails).toStrictEqual(testData.movieDetails);
  });
});

describe("doFetchTvShowDetails", () => {
  beforeEach(() => {
    mockTvShowDetailsResponse();
  });

  test("should call the correct Web API", () => {
    doFetchTvShowDetails("bearer_token", 42);

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.themoviedb.org/3/tv/42?language=en-GB",
      {
        headers: {
          accept: "application/json",
          Authorization: "Bearer bearer_token"
        }
      }
    );
  });

  test("should return the TV show details", async () => {
    const tvShowDetails = await doFetchTvShowDetails("bearer_token", 42);
    expect(tvShowDetails).toStrictEqual(testData.tvShowDetails);
  });
});

describe("getProductionIdFromLocation", () => {
  test("should get production ID from Location", () => {
    const location = {
      toString: function() {
        return "http://localhost:63342/javascript-sandbox/11-flix-app-project/movie-details.html?id=42";
      }
    }
    const movieId = getProductionIdFromLocation(location);
    expect(movieId).toBe(42);
  });
});

describe("getDisplayUsDollars", () => {
  test("should format a US dollars amount in the English locale", () => {
    expect(getDisplayUsDollars(2000000)).toBe("$2,000,000");
  });
});

function mockPopularMoviesResponse() {
  fetchSpy.mockResolvedValue(new Response(JSON.stringify(
    {
      "page": 1,
      "results": testData.popularMovies
    }))
  );
}

function mockPopularTvShowsResponse() {
  fetchSpy.mockResolvedValue(new Response(JSON.stringify({
      "page": 1,
      "results": testData.popularTvShows
    }))
  );
}

function mockMovieDetailsResponse() {
  fetchSpy.mockResolvedValue(new Response(JSON.stringify(testData.movieDetails)));
}

function mockTvShowDetailsResponse() {
  fetchSpy.mockResolvedValue(new Response(JSON.stringify(testData.tvShowDetails)));
}

const testData = {
  popularMovies: [
    {
      "id": 823464,
      "poster_path": "/z1p34vh7dEOnLDmyCrlUVLuoDzd.jpg",
      "release_date": "2024-03-27",
      "title": "Godzilla x Kong: The New Empire",
    },
    {
      "id": 653346,
      "poster_path": "/gKkl37BQuKTanygYQG1pyYgLVgf.jpg",
      "release_date": "2024-05-08",
      "title": "Kingdom of the Planet of the Apes",
    }
  ],
  movieDetails: {
    "backdrop_path": "/nb3xI8XI3w4pMVZ38VijbsyBqP4.jpg",
    "budget": 100000000,
    "genres": [
      {
        "id": 18,
        "name": "Drama"
      },
      {
        "id": 36,
        "name": "History"
      }
    ],
    "homepage": "http://www.oppenheimermovie.com",
    "id": 872585,
    "overview": "The story of J. Robert Oppenheimer\'s role in the development of the atomic bomb during World War II.",
    "poster_path": "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    "production_companies": [
      {
        "id": 9996,
        "name": "Syncopy"
      },
      {
        "id": 33,
        "name": "Universal Pictures"
      },
      {
        "id": 507,
        "name": "Atlas Entertainment"
      }
    ],
    "release_date": "2023-07-19",
    "revenue": 952000000,
    "runtime": 181,
    "status": "Released",
    "tagline": "The world forever changes.",
    "title": "Oppenheimer",
    "vote_average": 8.097
  },
  popularTvShows: [
    {
      "id": 1416,
      "poster_path": "/jcEl8SISNfGdlQFwLzeEtsjDvpw.jpg",
      "first_air_date": "2005-03-27",
      "name": "Grey's Anatomy",
    },
    {
      "id": 91239,
      "poster_path": "/luoKpgVwi1E5nQsi7W0UuKHu2Rq.jpg",
      "first_air_date": "2020-12-25",
      "name": "Bridgerton",
    },
  ],
  tvShowDetails: {
    "backdrop_path": "/q8fmM50In8xGVW0iYoENPa71kAA.jpg",
    "first_air_date": "1964-01-01",
    "genres": [
      {
        "id": 10764,
        "name": "Reality"
      }
    ],
    "homepage": "http://www.bbc.co.uk/programmes/b00704hg",
    "id": 1636,
    "last_air_date": "2006-12-25",
    "last_episode_to_air": {
      "id": 85853,
      "overview": "",
      "name": "December 25, 2006",
      "vote_average": 0,
      "vote_count": 0,
      "air_date": "2006-12-25",
      "episode_number": 31,
      "episode_type": "finale",
      "production_code": "",
      "runtime": 60,
      "season_number": 43,
      "show_id": 1636,
      "still_path": null
    },
    "name": "Top of the Pops",
    "number_of_episodes": 2205,
    "overview": "The biggest stars, the most iconic performances, the most outrageous outfits – it’s Britain’s number one pop show.",
    "poster_path": "/jjfTTjVYWyD6rGHVbnC44IrsJ7P.jpg",
    "production_companies": [
      {
        "id": 3324,
        "logo_path": "/dqT3yOTlfJRmtvk52Ccd1O6dZ0A.png",
        "name": "BBC",
        "origin_country": "GB"
      }
    ],
    "status": "Ended",
    "vote_average": 6.576,
  }
};