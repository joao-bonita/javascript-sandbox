/**
 * @jest-environment jsdom
 */

import "whatwg-fetch";
const { getLocalPage, doGetPopularMovies} = require("./script");

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

describe("doGetPopularMovies", () => {
  beforeEach(() => {
    mockPopularMoviesResponse();
  });

  test("doGetPopularMovies should call the correct Web API", async () => {
    await doGetPopularMovies("bearer_token");

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

  test("doGetPopularMovies should return the list of popular movies", async () => {
    const movies = await doGetPopularMovies("bearer_token");

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

function mockPopularMoviesResponse() {
  fetchSpy.mockResolvedValue(new Response('{\n' +
    '  "page": 1,\n' +
    '  "results": [\n' +
    '    {\n' +
    '      "id": 823464,\n' +
    '      "poster_path": "/z1p34vh7dEOnLDmyCrlUVLuoDzd.jpg",\n' +
    '      "release_date": "2024-03-27",\n' +
    '      "title": "Godzilla x Kong: The New Empire"\n' +
    '    },\n' +
    '    {\n' +
    '      "id": 653346,\n' +
    '      "poster_path": "/gKkl37BQuKTanygYQG1pyYgLVgf.jpg",\n' +
    '      "release_date": "2024-05-08",\n' +
    '      "title": "Kingdom of the Planet of the Apes"\n' +
    '    }\n' +
    '  ],' +
    '  "total_pages": 44217,\n' +
    '  "total_results": 884323\n' +
    '}'));
}
