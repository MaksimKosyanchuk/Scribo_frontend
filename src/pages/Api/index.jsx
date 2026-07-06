import { useEffect } from 'react'
import { ApiReferenceReact } from '@scalar/api-reference-react'
import '@scalar/api-reference-react/style.css'
import "./Api.scss";

function Api() {

  useEffect(() => {
    const checkAndAddBadge = () => {
      const badges = document.querySelectorAll('.badge');
      
      badges.forEach((badge) => {
        if (badge.textContent.trim() === 'v3.4.x' && !badge.innerHTML.includes('outdated-label')) {
          badge.innerHTML += ` <p class="outdated-label"
          ">Outdated</p>`;
        }
      });
    };

    const observer = new MutationObserver(() => {
      checkAndAddBadge();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    checkAndAddBadge();

    return () => observer.disconnect();
  }, []);

  return (
    <ApiReferenceReact
      configuration={{
        url: `${process.env.REACT_APP_API_URL}/api/docs`
      }}
    />
  )
}

export default Api;