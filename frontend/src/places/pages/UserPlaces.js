import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import PlaceList from '../components/PlaceList';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';

//const DUMMY_PLACES = [
//    {
//        id: 'p1',
//        title: 'Catedral',
//        description: 'big cone na cidade',
//        imageUrl: 'https://www.grandelojadoparana.org.br/wp-content/uploads/2021/08/WhatsApp-Image-2021-08-29-at-11.07.20-256x256.jpeg',
//        address: 'Praça da Catedral, s/n - Zona 02, Maringá - PR, 87010-530',
//        location: {
//            lat: -23.4261063,
//            lng: -51.938256
//        },
//        creator: 'u1'
//    },
//    {
//        id: 'p2',
//        title: 'Catedral TESTE 2',
//        description: 'big cone na cidade',
//        imageUrl: 'https://www.grandelojadoparana.org.br/wp-content/uploads/2021/08/WhatsApp-Image-2021-08-29-at-11.07.20-256x256.jpeg',
//        address: 'Praça da Catedral, s/n - Zona 02, Maringá - PR, 87010-530',
//        location: {
//            lat: -23.4261063,
//            lng: -51.938256
//        },
//        creator: 'u2'
//    }
//]

const UserPlaces = () => {
  const [loadedPlaces, setLoadedPlaces] = useState();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const userId = useParams().userId;

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/places/user/${userId}`
        );
        setLoadedPlaces(responseData.places);
      } catch (err) {}
    };
    fetchPlaces();
  }, [sendRequest, userId]);

     // const loadedPlaces = DUMMY_PLACES.filter(places => places.creator === userId);

  const placeDeletedHandler = deletedPlaceId => {
    setLoadedPlaces(prevPlaces =>
      prevPlaces.filter(place => place.id !== deletedPlaceId)
    );
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && loadedPlaces && (
        <PlaceList items={loadedPlaces} onDeletePlace={placeDeletedHandler} />
      )}
    </React.Fragment>
  );
};

export default UserPlaces;
