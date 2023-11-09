
import React, {useEffect, useState, useCallback} from "react";

import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';

function Organizations(props:any) {
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [option, setOption] = useState({
        "page":0, 
        "submit":true
    })

    const get_organizations = useCallback(async () => {
        if(!option.submit)
            return
        else
            setOption({...option, submit:false})

        const url:string = "api/organizations?" + new URLSearchParams({
            page: String(option.page)
        })
        console.log(url)

        const res = await fetch(url, {
            method: 'get',
            headers: {'Content-Type': 'application/json'}});

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
    }, [option, organizations]);

    useEffect(() => {
        get_organizations();
      }, [get_organizations]);

    return (
        <Container className="main" fluid="lg">
            <h2>Organizations</h2>
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