import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(i,m,p,a,c,t){
                c.ire_o=p;
                c[p]=c[p]||function(){(c[p].a=c[p].a||[]).push(arguments)};
                t=a.createElement(m);
                var z=a.getElementsByTagName(m)[0];
                t.async=1;
                t.src=i;
                z.parentNode.insertBefore(t,z)
              })('https://utt.impactcdn.com/P-A6730658-6e3d-44de-aa72-b8401efcd68e1.js','script','impactStat',document,window);
              impactStat('transformLinks');
              impactStat('trackImpression');
            `
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
