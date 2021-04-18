import {useState, useEffect} from 'react';
const {createClient} = require('contentful/dist/contentful.browser.min.js');

export default function useContentfulConfig() {
  const [client, setClient] = useState(null);

  useEffect(() => {
    const contentfulClient = createClient({
      // This is the space ID. A space is like a project folder in Contentful terms
      space: 'wi1z1u1iwrjl',
      // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
      accessToken: 'glmyUCNVQfpdUe-pOpcNdbcn2nhllp-dNhAOu0o8ArY',
    });

    setClient(contentfulClient);
  }, []);

  return client;
}
