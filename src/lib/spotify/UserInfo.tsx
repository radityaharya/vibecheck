import SpotifyWebApi from "spotify-web-api-node";

export const getSpotifyUserInfo = async (accessToken: string) => {
  const spt = new SpotifyWebApi({
    accessToken,
  });

  const me = await spt.getMe();

  return me.body;
};
