import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "src/lib/supabase/client";

const App = () => (
  <Auth
    supabaseClient={supabase}
    appearance={{ theme: ThemeSupa }}
    providers={["spotify"]}
    theme="dark"
    onlyThirdPartyProviders={true}
    redirectTo="/api/user/register"
    providerScopes={{
      spotify:
        "playlist-read-collaborative playlist-modify-private user-follow-modify user-library-modify user-read-private app-remote-control user-top-read user-read-recently-played user-read-email user-library-read user-follow-read user-read-playback-state user-modify-playback-state user-read-currently-playing playlist-read-private playlist-modify-public user-read-playback-position",
    }}
  />
);

export default App;
