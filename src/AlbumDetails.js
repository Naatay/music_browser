import React, { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import placeholder from './Resources/AlbumCoverPlaceHolder.jpg'
import Loading from './Loading';
import { redirect } from './helpers'

class AlbumDetails extends Component {

    constructor(props) {
        super(props);
        this.state = {
            tracks: [],
            isLoading: true
        };
    }

    getTracksFromAlbum = (id) => {
        fetch('https://api.spotify.com/v1/albums/' + id + '/tracks', {
            method: 'get',
            headers: new Headers({
                'Authorization': 'Bearer ' + sessionStorage.getItem('token')
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    throw data.error
                }
                let albumDuration = this.getAlbumDuration(data.items)
                this.setState({
                    tracks: data.items,
                    albumDuration: albumDuration,
                    isLoading: false,
                })
            })
            .catch((err) => {
                if (err.status) {
                    if (err.status === 401)
                      alert('Sesja wygasła!')
                      redirect()
                  }
            })
    }

    getAlbumPopularity = (id) => {
        fetch('https://api.spotify.com/v1/albums/' + id, {
            method: 'get',
            headers: new Headers({
                'Authorization': 'Bearer ' + sessionStorage.getItem('token')
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    throw data.error
                }
                this.setState({
                    popularity: data.popularity,
                    imageURL: data.images[1].url
                })
            })
            .catch((err) => {
                if (err.status) {
                    if (err.status === 401)
                      alert('Sesja wygasła!')
                      redirect()
                  }
            })
    }

    getAlbumDuration = (tracks) => {
        let sum = 0
        tracks.map(track => sum += parseInt(track.duration_ms))
        let formatted = this.formatTime(sum)
        return formatted
    }

    componentWillMount() {
        this.getAlbumPopularity(this.props.albumId)
        this.getTracksFromAlbum(this.props.albumId)
    }

    formatTime = (time_ms) => {
        let moment = require('moment');
        let formatted = moment().startOf('day')
            .seconds(time_ms / 1000)
            .format('H:mm:ss');
        return formatted
    }

    render() {
        let listTracks = null
        if (this.state.tracks != undefined) {
            listTracks = this.state.tracks.map(track => (
                <div key={track.id}>> {track.name} ({this.formatTime(track.duration_ms)})</div>
            ));
        }

        return (
            <div>
                {this.state.isLoading ? <Loading /> :
                    <Container>
                        <Row>
                            <Col sm={6} >
                                <table style={{ width: '100%', align: 'center', textAlign: 'center' }} >
                                    <tbody>
                                        <tr><td>
                                            <img style={{ width: '70%' }} src={this.state.imageURL !== undefined ? this.state.imageURL : placeholder} />
                                        </td></tr>
                                    </tbody>
                                </table>
                                <Row style={{ marginTop: '16px' }}><p style={{ width: '100%', textAlign: 'center' }}>czas trwania albumu: {this.state.albumDuration}</p></Row>
                                <Row><p style={{ width: '100%', textAlign: 'center' }}>popularność: {this.state.popularity}</p></Row>
                            </Col>
                            <Col sm={6}>
                                {listTracks}
                            </Col>
                        </Row>
                    </Container>
                }
            </div>
        );
    }
}

export default AlbumDetails;
