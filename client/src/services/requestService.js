import axios from 'axios';
import { SERVER_BASE_URL } from '../config/env';


const api = axios.create({
    baseURL: SERVER_BASE_URL,
    withCredentials: true
});

/* Generalnie format prawie wszystkich żądań jest taki sam
    GET - get(url, cache) - cache domyślnie jest true, jak chcecie false gdzieś to możecie dać false
    POST, PUT, PATCH - (url, body) - nieważne czy body to obiekt zwykły czy formdata (jak coś to dajecie do body zwykły obiekt BEZ STRINGIFY)
    DELETE - delete(url)

    OUTPUT:
    to jest taki obiekt jaki wysyła backend, nie trzeba robić response.data (bo wszystko będzie od razu w response)
    dlatego też nie ma response.ok, nie używajcie tego, tylko response.success
*/

export class requestService {

    //cache jest domyślnie na true, można zmieniać w zależności od potrzeby
    async get(url, cache = true) {

        let config = {
            headers: {}
        };

        if (!cache) {
            config.headers["Cache-Control"] = "no-store";
        }

        const response = await api.get(url, config);
        return response.data;

    }

    //jako body obiekt zwykły javascriptowy albo multipart/form-data i axios sam rozpozna
    //tak samo w put i patch
    async post(url, body) {

        const response = await api.post(url, body);
        return response.data;

    }

    async put(url, body) {
        const response = await api.put(url, body);
        return response.data;
    }


    async patch(url, body) {
        const response = await api.patch(url, body);
        return response.data;
    }

    async delete(url) {
        const response = await api.delete(url);
        return response.data;
    }


}

export const service = new requestService();