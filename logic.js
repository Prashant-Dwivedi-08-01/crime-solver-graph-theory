
document.getElementById('nodes').addEventListener('submit', function (e) {
    e.preventDefault();
    let n = document.getElementById('n_nodes').value
    let input_canvas = document.getElementById('input-canvas');
    input_canvas.innerHTML = '';
    for (let i = 1; i <= n; i++) {

        let wrapper = document.createElement('div');
        wrapper.className = 'mb-3 mx-5';
        wrapper.id = 'interrogation' + i;

        let h5 = document.createElement('h5');
        h5.innerHTML = 'Suspect ' + i;
        wrapper.appendChild(h5);

        for (let j = 1; j <= n; j++) {
            if (j == i) continue;
            let form_check = document.createElement('div');
            form_check.className = 'form-check';

            let input = document.createElement('input');
            input.className = 'form-check-input';
            input.type = 'checkbox';
            input.id = 'suspect' + i + '-suspect' + j;

            let label = document.createElement('label');
            label.for = 'suspect' + i + '-suspect' + j;
            label.innerHTML = 'Suspect ' + j;
            label.className = 'form-check-label';

            form_check.appendChild(input);
            form_check.appendChild(label);
            wrapper.appendChild(form_check);
        }
        input_canvas.appendChild(wrapper);

        document.getElementById('create-graph-btn').style.display = 'block';

    }
});


let person_interrogation = document.getElementById('create-graph-form');
person_interrogation.addEventListener('submit', function (e) {
    let graph_section = document.getElementById('graph-section');
    graph_section.style.display = 'flex';

    e.preventDefault();
    let n = document.getElementById('n_nodes').value
    let input_canvas = document.getElementById('input-canvas');
    let interrogation_result = {}

    for (let i = 1; i <= n; i++) {
        interrogation_result['Suspect ' + i] = [];
        for (let j = 1; j <= n; j++) {
            if (j == i) continue;
            let checkbox = document.getElementById('suspect' + i + '-suspect' + j);
            if (checkbox.checked) {
                interrogation_result['Suspect ' + i].push('Suspect ' + j);
            }
        }
    }
    const gData_1 = {
        nodes: [],
        links: []
    }

    for (let i = 1; i <= n; i++) {
        // nodes
        gData_1.nodes.push({
            id: 'Suspect ' + i,
            name: 'Suspect ' + i,
            group: i
        })

        // links of a node 
        // IMPORTANT: the source and target must be the index of the nodes array and thus j=0 is the first node
        for (let j = 0; j < interrogation_result['Suspect ' + i].length; j++) {
            gData_1.links.push({
                source: 'Suspect ' + i,
                target: interrogation_result['Suspect ' + i][j],
                value: i
            })
        }
    }

    const Frontend_Graph = ForceGraph()
        (document.getElementById('graph'))
        .graphData(gData_1)
        .nodeLabel('name')
        .width(500)
        .height(500)
        .linkDirectionalArrowLength(6)
        .linkWidth(3)
        .nodeId('id')
        .nodeAutoColorBy('group')
        .nodeCanvasObject((node, ctx, globalScale) => {
            const label = node.id;
            // const fontSize = 10;
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding

            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = node.color;
            ctx.fillText(label, node.x, node.y);

            node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
        })
        .nodePointerAreaPaint((node, color, ctx) => {
            ctx.fillStyle = color;
            const bckgDimensions = node.__bckgDimensions;
            bckgDimensions && ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
        });

    Frontend_Graph.d3Force('center', null);

    // fit to canvas when engine stops
    Frontend_Graph.onEngineStop(() => Frontend_Graph.zoomToFit(400));

    let nodes = []

    for (let i = 1; i <= n; i++) {
        nodes.push('Suspect ' + i);
    }

    let body = {
        no_of_nodes: parseInt(n),
        nodes: nodes,
        no_of_people_telling_truth: document.getElementById('n_telling_truth').value
    }

    Object.keys(interrogation_result).map((node) => {
        body[node] = interrogation_result[node]
    })


    let no_of_nodes = parseInt(n)
    let no_of_people_telling_truth = document.getElementById('n_telling_truth').value


    let edges_entering_each_nodes = {};

    for (let i = 0; i < no_of_nodes; i++) {
        edges_entering_each_nodes[nodes[i]] = [] // make edges_entering_each_nodes dic with each node as key and empty list 
    }

    for (let i = 0; i < no_of_nodes; i++) {
        let curr_node = nodes[i]
        let ngbr = body[curr_node] // neighbours of a node eg. "A": ["B", "C"] is present in body
        for (let j = 0; j < ngbr.length; j++) {
            edges_entering_each_nodes[ngbr[j]].push(curr_node)
        }
    }

    console.log("edges_entering_each_nodes: ", edges_entering_each_nodes);


    let list_of_suspects = [];
    for (var i = 0; i < no_of_nodes; i++) {
        if (edges_entering_each_nodes[nodes[i]].length == no_of_people_telling_truth) {
            list_of_suspects.push(nodes[i]);
        }
    }

    console.log(list_of_suspects);

    var culprits = list_of_suspects;
    let result_section = document.getElementById("result-section")

    let ul = document.createElement("ul")
    ul.className = "list-group";

    for (let i = 0; i < culprits.length; i++) {
        let li = document.createElement("li");
        li.className = "list-group-item";
        li.innerHTML = culprits[i]
        ul.appendChild(li)
    }

    result_section.appendChild(ul)

    // fetch("/solve", {
    //     method: "POST",
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify(body)
    // })
    //     .then(response => response.json())
    //     .then(data => {
    //         console.log(data);
    //         var culprits = data["list_of_suspects"];
    //         let result_section = document.getElementById("result-section")

    //         let ul = document.createElement("ul")
    //         ul.className = "list-group";

    //         for (let i = 0; i < culprits.length; i++) {
    //             let li = document.createElement("li");
    //             li.className = "list-group-item";
    //             li.innerHTML = culprits[i]
    //             ul.appendChild(li)
    //         }

    //         result_section.appendChild(ul)

    //     })
});
