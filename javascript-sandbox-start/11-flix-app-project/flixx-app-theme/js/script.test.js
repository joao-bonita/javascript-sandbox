/**
 * @jest-environment jsdom
 */

import "whatwg-fetch";

const {
  getLocalPage,
  doFetchPopularMovies,
  doFetchPopularTvShows,
  doFetchMovieDetails,
  getMovieIdFromLocation,
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

    expect(movies).toStrictEqual([
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
    ]);
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

    expect(tvShows).toStrictEqual([
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
    ]);
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

    expect(movieDetails).toEqual({
      "backdrop_path": "/nb3xI8XI3w4pMVZ38VijbsyBqP4.jpg",
            "budget": 100000000,
          "genres": [
            {
              "id": 18,
              "name": "Drama"
            } ,
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
        });
  });
});

describe("getMovieIdFromLocation", () => {
  test("should get movie ID from Location", () => {
    const location = {
      toString: function() {
        return "http://localhost:63342/javascript-sandbox/11-flix-app-project/movie-details.html?id=42";
      }
    }
    const movieId = getMovieIdFromLocation(location);
    expect(movieId).toBe(42);
  });
});

describe("getDisplayUsDollars", () => {
  test("should format a US dollars amount in the English locale", () => {
    expect(getDisplayUsDollars(2000000)).toBe("$2,000,000");
  });
});

function mockPopularMoviesResponse() {
  fetchSpy.mockResolvedValue(new Response('{' +
    '  "page": 1,' +
    '  "results": [' +
    '    {' +
    '      "id": 823464,' +
    '      "poster_path": "/z1p34vh7dEOnLDmyCrlUVLuoDzd.jpg",' +
    '      "release_date": "2024-03-27",' +
    '      "title": "Godzilla x Kong: The New Empire"' +
    '    },' +
    '    {' +
    '      "id": 653346,' +
    '      "poster_path": "/gKkl37BQuKTanygYQG1pyYgLVgf.jpg",' +
    '      "release_date": "2024-05-08",' +
    '      "title": "Kingdom of the Planet of the Apes"' +
    '    }' +
    '  ],' +
    '  "total_pages": 44217,' +
    '  "total_results": 884323' +
    '}'));
}

function mockPopularTvShowsResponse() {
  fetchSpy.mockResolvedValue(new Response('{' +
    '  "page": 1,' +
    '  "results": [' +
    '    {' +
    '      "id": 1416,' +
    '      "poster_path": "/jcEl8SISNfGdlQFwLzeEtsjDvpw.jpg",' +
    '      "first_air_date": "2005-03-27",' +
    '      "name": "Grey\'s Anatomy"' +
    '    },' +
    '    {' +
    '      "id": 91239,' +
    '      "poster_path": "/luoKpgVwi1E5nQsi7W0UuKHu2Rq.jpg",' +
    '      "first_air_date": "2020-12-25",' +
    '      "name": "Bridgerton"' +
    '    }' +
    '  ],' +
    '  "total_pages": 8644,' +
    '  "total_results": 172880' +
    '}'));
}

function mockMovieDetailsResponse() {
  fetchSpy.mockResolvedValue(new Response('{' +
    '  "backdrop_path": "/nb3xI8XI3w4pMVZ38VijbsyBqP4.jpg",' +
    '  "budget": 100000000,' +
    '  "genres": [' +
    '    {' +
    '      "id": 18,' +
    '      "name": "Drama"' +
    '    },' +
    '    {' +
    '      "id": 36,' +
    '      "name": "History"' +
    '    }' +
    '  ],' +
    '  "homepage": "http://www.oppenheimermovie.com",' +
    '  "id": 872585,' +
    '  "overview": "The story of J. Robert Oppenheimer\'s role in the development of the atomic bomb during World War II.",' +
    '  "poster_path": "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",' +
    '  "production_companies": [' +
    '    {' +
    '      "id": 9996,' +
    '      "name": "Syncopy"' +
    '    },' +
    '    {' +
    '      "id": 33,' +
    '      "name": "Universal Pictures"' +
    '    },' +
    '    {' +
    '      "id": 507,' +
    '      "name": "Atlas Entertainment"' +
    '    }' +
    '  ],' +
    '  "release_date": "2023-07-19",' +
    '  "revenue": 952000000,' +
    '  "runtime": 181,' +
    '  "status": "Released",' +
    '  "tagline": "The world forever changes.",' +
    '  "title": "Oppenheimer",' +
    '  "vote_average": 8.097' +
    '}'));
}

