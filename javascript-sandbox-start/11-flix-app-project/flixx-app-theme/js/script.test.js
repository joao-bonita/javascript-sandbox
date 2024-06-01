/**
 * @jest-environment jsdom
 */

import "whatwg-fetch";
const { getLocalPage, doFetchPopularMovies, doFetchPopularTvShows} = require("./script");

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

