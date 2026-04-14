import { supabase } from '@/lib/supabase';

interface NodeWithChildren {
    id: string;
    name: string;
    type: string;
    unit_code: string;
    parent_id: string | null;
    metadata: Record<string, unknown>;
    children: NodeWithChildren[];
    full_code?: string;
}

export const machineService = {
    async getMachines() {
        const { data: allUnits, error: unitsError } = await supabase
            .from('organizational_units')
            .select('*');

        if (unitsError) throw unitsError;

        const map: Record<string, NodeWithChildren> = {};
        allUnits.forEach(node => { map[node.id] = { ...node, children: [] }; });
        
        allUnits.forEach(node => {
          if (node.parent_id && map[node.parent_id]) {
            map[node.parent_id].children.push(map[node.id]);
          }
        });

        const computeCode = (nodeId: string, parentCode: string = ''): string => {
            const node = map[nodeId];
            if (node.type === 'country') {
                node.full_code = ''; 
                node.children.forEach(child => computeCode(child.id, ''));
                return '';
            }
            const currentCode = node.unit_code || '??';
            const separator = parentCode ? '-' : '';
            const fullCode = `${parentCode}${separator}${currentCode}`;
            node.full_code = fullCode;
            node.children.forEach(child => computeCode(child.id, fullCode));
            return fullCode;
        };

        const roots = allUnits.filter(n => !n.parent_id);
        roots.forEach(root => computeCode(root.id));

        // Return only machines
        return allUnits
            .filter(n => n.type === 'machine')
            .map(n => {
                const node = map[n.id];
                return {
                    id: node.id,
                    name: node.name,
                    code: node.full_code,
                    type: node.type,
                    status: node.metadata?.status || 'idle',
                    location: node.metadata?.location || ''
                };
            });
    },

    async getMachineById(id: string) {
        // For simplicity and consistency, reuse getMachines
        const machines = await this.getMachines();
        return machines.find(m => m.id === id) || null;
    },

    async getMachineDetail(id: string) {
        const { data: machine, error: machineError } = await supabase
            .from('organizational_units')
            .select('*')
            .eq('id', id)
            .single();

        if (machineError) throw machineError;

        // Get all units to compute path
        const { data: allUnits, error: unitsError } = await supabase
            .from('organizational_units')
            .select('*');
        if (unitsError) throw unitsError;

        const map: Record<string, any> = {};
        allUnits.forEach(u => map[u.id] = u);

        const path: any[] = [];
        let current = map[id];
        while (current && current.parent_id) {
            const parent = map[current.parent_id];
            if (parent) {
                path.push({
                    name: parent.name,
                    type: parent.type
                });
                current = parent;
            } else {
                break;
            }
        }

        // Determine full code
        const machines = await this.getMachines();
        const machineWithCode = machines.find(m => m.id === id);

        const { data: history, error: historyError } = await supabase
            .from('maintenance_tickets')
            .select('*')
            .eq('machine_id', id)
            .order('scheduled_date', { ascending: false });

        if (historyError) throw historyError;

        return {
            asset: {
                ...machine,
                code: machineWithCode?.code || machine.unit_code,
                location_path: path.reverse() // [Client, City, Site, Zone]
            },
            history
        };
    }
};
