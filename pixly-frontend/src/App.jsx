import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import RouteList from "./RouteList";
import PixlyApi from "./api";
import NavBar from "./NavBar";
import LoadingBar from "./LoadingBar";
import {
  Box,
  Button,
  Grommet,
  grommet,
  Header,
  Page,
  PageContent,
  Data,
  Toolbar,
  DataSearch,
  DataTable,
} from "grommet";
import { Moon, Sun } from "grommet-icons";
import { deepMerge } from "grommet/utils";

/** Component for entire page.
 *
 * Props: none
 * State:
 * -photos: [date_time, iso, height, width, color, make, key, author]
 * -isLoading: true/false
 * -dark: true/false
 *
 *
 *
 * App -> NavBar -> RoutesList
 *
 */

/////////////////////////////////////////////////// Global Element Styles

const theme = deepMerge(grommet, {
  global: {
    colors: {
      brand: "neutral-1",
      dark: "blue",
      light: "black",
    },
    font: {
      family: "Roboto",
      size: "18px",
      height: "20px",
    },
  },
});

const AppBar = (props) => (
  <Header
    background="#AAAAAA"
    pad={{ left: "medium", right: "small", vertical: "small" }}
    elevation="medium"
    {...props}
  />
);
////////////////////////////////////////////////////////////////// APP

const App = () => {
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dark, setDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [saveSearch, setSaveSearch] = useState(localStorage.getItem("search"));

  const location = useLocation();

  /** Retrieves all photos from database on mount. */
  useEffect(
    function fetchAllPhotosOnMount() {
      async function fetchPhotos() {
        if (location.pathname === "/photos") {
          setIsLoading(true);
          const photos = await PixlyApi.getAllPhotos();

          setPhotos(photos);
          setIsLoading(false);
        }
      }

      fetchPhotos();
    },
    [location.pathname]
  );

  /** Clear local storage whenever the path is not /upload. */
  useEffect(
    function clearLocalStorage() {
      if (!location.pathname.startsWith("/upload")) {
        localStorage.clear();
      }
    },
    [location.pathname]
  );

  /** handle search bar and update local storage to use for API call to filter by search. */
  const handleSearch = async (query) => {
    localStorage.setItem("search", query);
    setSaveSearch(localStorage.getItem("search"));

    const data = await PixlyApi.getAllPhotos(query);
    setPhotos(data);
    setSearchQuery(query);
  };

  /** Get all items on search. */
  useEffect(() => {
    async function searchDB() {
      try {
        const data = await PixlyApi.getAllPhotos(
          localStorage.getItem("search")
        );
        setPhotos(data);
      } catch (error) {
        console.error("Error happened searching:", error);
      }
    }
    searchDB();
  }, [saveSearch]);

  /** handleSave receives photoData from form and sends to backend */
  async function handleSave(uploadData) {
    let resp;
    setIsLoading(true);

    try {
      resp = await PixlyApi.upload(uploadData);
    } catch (err) {
      console.log(err);
    }

    setIsLoading(false);
    return resp;
  }

  /** rgbEditSave receives rgb from form and sends to backend to edit image */
  async function rgbEditSave(photoId, rgbVals) {
    let resp;
    setIsLoading(true);

    try {
      resp = await PixlyApi.editPhoto({ imgId: photoId, rgbVals });
    } catch (error) {
      console.error("Error editing photo:", error);
    }
    setIsLoading(false);

    return resp;
  }

  /** convert_bw receives a photoId and responds with b&w photo */
  async function convert_to_bw(photoId) {
    let resp;
    setIsLoading(true);

    try {
      resp = await PixlyApi.editPhoto({ imgId: photoId, convert_bw: true });
    } catch (error) {
      console.error("Error converting to B&W:", error);
    }
    setIsLoading(false);

    return resp;
  }

  return (
    <Grommet theme={theme} full themeMode={dark ? "dark" : "light"}>
      {isLoading ? (
        <LoadingBar />
      ) : (
        <div>
          <Page>
            <AppBar>
              {location.pathname === "/photos" && (
                <>
                  <Toolbar>
                    <form>
                      <DataSearch
                        onChange={(event) => handleSearch(event.target.value)}
                        value={searchQuery}
                      />
                    </form>
                  </Toolbar>
                  <DataTable />
                </>
              )}
              <Button
                a11yTitle={
                  dark ? "Switch to Light Mode" : "Switch to Dark Mode"
                }
                icon={dark ? <Moon /> : <Sun />}
                onClick={() => setDark(!dark)}
                tip={{
                  content: (
                    <Box
                      pad="small"
                      round="small"
                      background={dark ? "light-2" : "dark-1"}
                    >
                      {dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    </Box>
                  ),
                  plain: true,
                }}
              />
              <NavBar />
            </AppBar>
            <PageContent>
              <RouteList
                handleSave={handleSave}
                rgbEditSave={rgbEditSave}
                photos={photos}
                convert_to_bw={convert_to_bw}
              />
            </PageContent>
          </Page>
        </div>
      )}
    </Grommet>
  );
};

export default App;
