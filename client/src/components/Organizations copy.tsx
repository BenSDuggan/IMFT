
import React, {useEffect, useState} from "react";

import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Pagination from 'react-bootstrap/Pagination';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';

function Organizations(props:any) {
    let display_date = (date:Date) => new Date(date).toLocaleString();
    let min_date = (offset:number):Date => new Date(new Date().getTime() - offset);

    const [range, setRange] = useState("1d");
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [option, setOption] = useState({
        "min_date":min_date(90*24*60*60*1000), 
        "max_date": new Date(), 
        "lid":props.lid ?? null, 
        "page":0, 
        "submit":true})

    async function get_organizations(ignore:boolean) {
        const url:string = "api/organizations?" + new URLSearchParams({
            page: String(option.page),
            date: "hi"
        })
        console.log(url)

        const res = await fetch(url, { 
            method: 'get',
            headers: {'Content-Type': 'application/json'}});

        if (!ignore) {
            res.json().then((data) => {
                console.log(data);
                let t = JSON.parse(JSON.stringify(organizations));

                if(option.page === 0)
                    setOrganizations(data.data);
                else {
                    t.push(...data.data)
                    setOrganizations(t);
                }
            })
            .catch((error) => console.error(error));
        }
    }

    let set_filter_date = (key:string) => {
        setRange(key);

        switch (key) {
            case '1d':
                setOption({...option, min_date:min_date(1*24*60*60*1000), max_date:new Date(), page:0, submit:true});
                break;
            case '1w':
                setOption({...option, min_date:min_date(7*24*60*60*1000), max_date:new Date(), page:0, submit:true});
                break;
            case '1m':
                setOption({...option, min_date:min_date(30*24*60*60*1000), max_date:new Date(), page:0, submit:true});
                break;
            case '2m':
                setOption({...option, min_date:min_date(60*24*60*60*1000), max_date:new Date(), page:0, submit:true});
                break;
            case '3m':
                setOption({...option, min_date:min_date(90*24*60*60*1000), max_date:new Date(), page:0, submit:true});
                break;
            default:
                setOption({...option, min_date:min_date(1*24*60*60*1000), max_date:new Date(), page:0, submit:true});
        }
    }

    useEffect(() => {
        let ignore = false;

        get_organizations(ignore);

        return () => {ignore = true;}
      }, [option]);

    return (
        <Container className="main" fluid="lg">
            <h2>Trips</h2>
            <Container>
                <Row>
                    <Col sm={3}>
                        <Pagination>
                            <Pagination.Item key={'1d'} active={'1d' === range} onClick={()=>set_filter_date('1d')}>1 D</Pagination.Item>
                            <Pagination.Item key={'1w'} active={'1w' === range} onClick={()=>set_filter_date('1w')}>1 W</Pagination.Item>
                            <Pagination.Item key={'1m'} active={'1m' === range} onClick={()=>set_filter_date('1m')}>1 M</Pagination.Item>
                            <Pagination.Item key={'2m'} active={'2m' === range} onClick={()=>set_filter_date('2m')}>2 M</Pagination.Item>
                            <Pagination.Item key={'3m'} active={'3m' === range} onClick={()=>set_filter_date('3m')}>3 M</Pagination.Item>
                        </Pagination>
                    </Col>
                    <Col sm={3} className="trip-date-container">
                        <input 
                            className="trip-date-input"
                            type="date" 
                            value={option.min_date.toISOString().split("T")[0]} 
                            min="1970-01-01" 
                            max={new Date().toISOString().split("T")[0]}
                            onChange={(e) => setOption({...option, min_date:new Date(e.target.value)})}></input>
                        <span style={{padding: "0px 5px 0px 5px"}}>-</span>
                        <input 
                            type="date" 
                            value={option.max_date.toISOString().split("T")[0]} 
                            min="1970-01-01" 
                            max={new Date().toISOString().split("T")[0]}
                            onChange={(e) => setOption({...option, max_date:new Date(e.target.value)})}></input>
                    </Col>
                    <Col sm={1}>
                        <Button 
                            variant="primary" 
                            onClick={() => {
                                setOption({...option, page:0, submit:true})
                                setRange("other")
                            }}>Filter</Button>
                    </Col>
                </Row>
            </Container>
            <Container className="table-responsive">
                <Table>
                <thead>
                    <tr>
                        <th></th>
                        <th>Name</th>
                        <th># Aircraft</th>
                        <th># Hospitals</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    {organizations.map((organization) => 
                        <tr key={organization.oid}>
                            <td><a href={"/organization/"+organization.oid}>View Organization</a></td>
                            <td>{organization.display_name}</td>
                            <td>{organization.aircraft.length}</td>
                            <td>{organization.locations.length}</td>
                            <td>{organization.description}</td>
                        </tr>)}
                </tbody>
                </Table>
            </Container>
            <Button variant="secondary" onClick={()=>setOption({...option, page:option.page + 1, submit:true})}>Load more</Button>
        </Container>
    )
}

export default Organizations;