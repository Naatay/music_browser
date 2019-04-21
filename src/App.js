import React, { Component } from 'react';
import { Tooltip, Popover, OverlayTrigger, Table, Button, FormControl } from 'react-bootstrap';
import './App.css';
import ModalWindow from './ModalWindow';
import AlbumDetails from './AlbumDetails';
import Loading from './Loading'
import placeholder from './Resources/AlbumCoverPlaceHolder.jpg'
import { redirect } from './helpers'

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      error: false,
      isLoaded: false,
      items: [],
      query: '',
      offset: 0,
      albums: [],
      showDetails: false,
      total: 0,
      isLoading: false,
      limit: 20,
      hasMore: true,
      desc: false,
      hiddenFab: true,
    };

    window.onscroll = () => {
      if (this.state.error || this.state.isLoading || !this.state.hasMore) return;

      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 10 && this.state.query !== ''
      ) {
        this.loadAlbums(this.state.query, this.state.offset + this.state.limit, this.state.albums);
      }
    };
  }

  componentDidMount() {
    if (window.location.hash) {
      let hash = window.location.hash.substring(1);
      let re = new RegExp('(?<=access_token=).*?(?=&)');
      let token = hash.match(re)
      if (token) {
        sessionStorage.setItem('token', token);
      }
    }
    else {
      redirect();
    }
  }

  loadAlbums = (query, offset, oldAlbums) => {
    this.setState({ isLoading: true }, () => {
      fetch('https://api.spotify.com/v1/search?query=' + query + '&offset=' + offset + '&limit=20&type=album', {
        method: 'get',
        headers: new Headers({
          'Authorization': 'Bearer ' + sessionStorage.getItem("token")
        }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            throw data.error
          }
          this.setState({
            albums: [
              ...oldAlbums,
              ...data.albums.items,
            ],
            total: parseInt(data.albums.total),
            isLoading: false,
            offset: offset,
            hasMore: (parseInt(data.albums.total) > this.state.limit + offset),
          })
        })
        .catch((err) => {
          if (err.status) {
            if (err.status === 401)
              alert('Sesja wygasła!')
              redirect()
          }
        })
    })
  }

  handleSearch = (event) => {

    let query = event.target.value;

    if (query !== '') {
      this.loadAlbums(query, 0, [])
      document.body.scrollTop = document.documentElement.scrollTop = 0;
      this.setState(
        {
          query: query,
          offset: 0
        },
      );
    }
    else {
      this.setState(
        {
          query: query,
          albums: [],
          offset: 0
        },
      );
    }
  }

  handleCloseDetails = () => {
    this.setState({ showDetails: false });
  }

  handleShowDetails = (id, title) => {
    this.setState({
      showDetails: true,
      albumId: id,
      albumTitle: title,
    });
  }

  handlePageChange = (currentPageNumber) => {
    this.setState({
      currentPageNumber: parseInt(currentPageNumber.target.innerText),
    });
  }
  goToTop = () => {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  }

  compareDates = (a, b) => {

    const A = a.release_date.toUpperCase();
    const B = b.release_date.toUpperCase();

    let comparison = 0;
    if (A > B) {
      comparison = 1;
    } else if (A < B) {
      comparison = -1;
    }

    return this.state.desc ? comparison * -1 : comparison;
  }

  compareNames = (a, b) => {

    const A = a.name.toUpperCase();
    const B = b.name.toUpperCase();

    let comparison = 0;
    if (A > B) {
      comparison = 1;
    } else if (A < B) {
      comparison = -1;
    }

    return this.state.desc ? comparison * -1 : comparison;
  }

  sortAndUpdate = (attr) => {
    if (attr === 'release_date') {
      this.state.albums.sort(this.compareDates)
    } else {
      this.state.albums.sort(this.compareNames)
    }
    this.setState({
      desc: !this.state.desc
    })
  }

  render() {
    let listAlbums = []
    if (this.state.albums !== []) {
      listAlbums = this.state.albums.map(album => (
        <tr key={album.id} onClick={() => this.handleShowDetails(album.id, album.name)} className='listItem'>
          <td style={{ margin: '0px', padding: '0px' }}><img src={album.images[1] !== undefined ? album.images[1].url : placeholder} alt='Okładka' style={{ height: '90px', width: '90px' }} /></td>
          <td>{album.name}</td>
          <td>{album.artists.map(artist => (artist.name))}</td>
          <td>{album.release_date}</td>
          <td>{album.total_tracks}</td>
        </tr>
      ));
    }

    return (
      <div className='App'>
        <div className='App-header'>
          <FormControl autoFocus type='text' value={this.state.query} s placeholder='Szukaj albumu' onChange={this.handleSearch} style={{ width: '80%', margin: 'auto', marginTop: '6px', marginBottom: '6px' }} />
        </div>
        <div style={{ marginTop: '50px' }}>
          <Table hidden={this.state.albums.length === 0} striped bordered hover responsive style={{ width: '80%', margin: 'auto' }}>
            <thead>
              <tr>
                <th style={{ width: '90px' }}></th>
                <th className='sortable' onClick={() => this.sortAndUpdate('name')}>Nazwa albumu</th>
                <th>Wykonawca</th>
                <th className='sortable' onClick={() => this.sortAndUpdate('release_date')}>Data wydania</th>
                <th>Liczba utworów</th>
              </tr>
            </thead>
            <tbody>
              {listAlbums}
            </tbody>
          </Table>
          {this.state.isLoading ? <Loading /> : null}
        </div>
        {this.state.albums.length === 0 && this.state.query !== '' && !this.state.isLoading ? <p style={{ marginTop: '10px' }}> Brak wyników </p> : null}
        <OverlayTrigger
          placement={'top'}
          overlay={
          <Tooltip >
              Idź na początek.
          </Tooltip>
          }
        >
          <div hidden={this.state.albums.length === 0} onClick={this.goToTop} className='fab'>&uarr;</div>
        </OverlayTrigger>
        <ModalWindow handleClose={this.handleCloseDetails} handleShow={this.handleShowDetails} show={this.state.showDetails} size='lg' title={this.state.albumTitle}>
          <AlbumDetails albumId={this.state.albumId} />
        </ModalWindow>
      </div>
    );
  }
}

export default App;
