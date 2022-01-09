// @deno-types="https://deno.land/x/servest@v1.3.1/types/react/index.d.ts"
import React from "https://dev.jspm.io/react/index.js";
// @deno-types="https://deno.land/x/servest@v1.3.1/types/react-dom/server/index.d.ts"
import ReactDOMServer from "https://dev.jspm.io/react-dom/server.js";
import { createApp } from "https://deno.land/x/servest@v1.3.1/mod.ts";

let colores = ['red', 'green', 'yellow'];

const app = createApp();
app.handle("/", async (req) => {
  await req.respond({
    status: 200,
    headers: new Headers({
      "content-type": "text/html; charset=UTF-8",
    }),
    body: ReactDOMServer.renderToString(
      <html>
        <head>
          <meta charSet="utf-8" />
          <title>servest</title>
        </head>
        <body>
            <form method="POST" action="/">
                <input type="text" name="color" id="color" placeholder="Ingresar color" />
                <input type="submit" value="Enviar" />
            </form>
            <ul id="lista" style={{background:'black'}}>
                {colores.map((item, ) => {     
                    return (<li style={{color:item}}>{item}</li>)
                })}
            </ul>
        </body>
      </html>,
    ),
  });
});
app.listen({ port: 8888 });